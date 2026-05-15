'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateTimetable(semesterId: string) {
  const supabase = await createClient()

  try {
    // 0. Fetch Institution Settings (Working Days & Time Slots)
    const { data: daysData } = await supabase.from('working_days').select('*').eq('is_working', true).order('day_of_week')
    const { data: slotsData } = await supabase.from('time_slots').select('*').order('period_number')

    if (!daysData || daysData.length === 0) throw new Error('No working days configured.')
    if (!slotsData || slotsData.length === 0) throw new Error('No time slots configured.')

    const workingDays = daysData.map(d => d.day_of_week) // e.g. [1, 2, 3, 4, 5]
    // Only schedule classes in 'Class' type periods
    const classPeriods = slotsData.filter(s => s.type === 'Class').map(s => s.period_number) 

    // 1. Fetch current semester assignments
    const { data: assignments, error: assignErr } = await supabase
      .from('subject_faculty_mapping')
      .select(`
        id,
        classes_per_week,
        continuous_hours,
        subject_id,
        faculty_id,
        lab_id,
        fixed_slots,
        subjects!inner(name, code, type, semester_id)
      `)
      .eq('subjects.semester_id', semesterId)

    if (assignErr) throw new Error('Failed to fetch assignments: ' + assignErr.message)
    if (!assignments || assignments.length === 0) {
      throw new Error('No faculty assignments found for this semester. Please complete Design TT first.')
    }

    // Get target semester name to determine odd/even
    const { data: targetSemester, error: semErr } = await supabase
      .from('semesters')
      .select('name')
      .eq('id', semesterId)
      .single()

    if (semErr || !targetSemester) throw new Error('Could not fetch semester details.')
    
    // Helper to determine if target semester is Odd or Even
    const isOddSemester = (name: string) => {
       const lowerName = name.toLowerCase()
       if (lowerName.includes('odd')) return true
       if (lowerName.includes('even')) return false
       // Try parsing number
       const match = name.match(/\d+/)
       if (match) {
         return parseInt(match[0], 10) % 2 !== 0
       }
       // Default to treating as odd
       return true
    }

    const isTargetOdd = isOddSemester(targetSemester.name)

    // 2. Fetch all existing timetable slots globally
    const { data: globalSlotsRaw, error: slotErr } = await supabase
      .from('timetable_slots')
      .select(`
        day_of_week, 
        period_number, 
        faculty_id, 
        lab_id,
        timetables!inner(
          semester_id,
          semesters!inner(name)
        )
      `)
      .neq('timetables.semester_id', semesterId)

    if (slotErr) throw new Error('Failed to fetch global slots: ' + slotErr.message)

    // Filter globalSlots to only those in the same odd/even cycle
    const globalSlots = globalSlotsRaw?.filter((slot: any) => {
      const slotSemName = slot.timetables?.semesters?.name
      if (!slotSemName) return true
      const isSlotOdd = isOddSemester(slotSemName)
      return isSlotOdd === isTargetOdd
    }) || []

    // Build conflict maps
    const facultyOccupied: Record<number, Record<number, Set<string>>> = {}
    const labOccupied: Record<number, Record<number, Set<string>>> = {}
    const semesterGrid: Record<number, Record<number, any>> = {}
    
    for (const d of workingDays) {
      facultyOccupied[d] = {}
      labOccupied[d] = {}
      semesterGrid[d] = {}
      for (const p of classPeriods) {
        facultyOccupied[d][p] = new Set()
        labOccupied[d][p] = new Set()
        semesterGrid[d][p] = null
      }
    }

    globalSlots.forEach((slot: any) => {
      if (facultyOccupied[slot.day_of_week]?.[slot.period_number]) {
        facultyOccupied[slot.day_of_week][slot.period_number].add(slot.faculty_id)
      }
      if (slot.lab_id && labOccupied[slot.day_of_week]?.[slot.period_number]) {
        labOccupied[slot.day_of_week][slot.period_number].add(slot.lab_id)
      }
    })

    // Sort assignments: Labs (larger continuous blocks) first
    const sortedAssignments = [...assignments].sort((a: any, b: any) => {
      return (b.continuous_hours || 1) - (a.continuous_hours || 1)
    })

    const newSlots: any[] = []

    // 3.5 Pre-allocate Fixed Slots
    for (const assignment of sortedAssignments) {
      if (assignment.fixed_slots && Array.isArray(assignment.fixed_slots)) {
        for (const fs of assignment.fixed_slots) {
          const d = fs.day_of_week;
          const p = fs.period_number;
          
          if (workingDays.includes(d) && classPeriods.includes(p)) {
             if (semesterGrid[d][p] !== null) {
                throw new Error(`Scheduling Conflict! Fixed slot Day ${d} Period ${p} for ${(assignment.subjects as any).name} is already taken by another fixed slot.`);
             }
             if (facultyOccupied[d][p].has(assignment.faculty_id)) {
                throw new Error(`Scheduling Conflict! Faculty ${assignment.faculty_id} is already occupied on Day ${d} Period ${p} by global slot.`);
             }
             if (assignment.lab_id && labOccupied[d][p].has(assignment.lab_id)) {
                throw new Error(`Scheduling Conflict! Lab is already occupied on Day ${d} Period ${p}.`);
             }

             semesterGrid[d][p] = assignment
             facultyOccupied[d][p].add(assignment.faculty_id)
             if (assignment.lab_id) labOccupied[d][p].add(assignment.lab_id)
             
             newSlots.push({ day_of_week: d, period_number: p, subject_id: assignment.subject_id, faculty_id: assignment.faculty_id, lab_id: assignment.lab_id })
             assignment.classes_per_week -= 1;
          }
        }
      }
    }

    // 4. Greedy Allocation
    for (const assignment of sortedAssignments) {
      const subjectType = (assignment.subjects as any).type
      const continuous = assignment.continuous_hours || 1
      let remainingClasses = assignment.classes_per_week

      const daysAssigned = new Set<number>()

      while (remainingClasses >= continuous) {
        let placed = false

        for (const d of workingDays) {
          if (subjectType === 'Theory' && daysAssigned.has(d)) continue

          // Find continuous blocks
          for (let pIdx = 0; pIdx <= classPeriods.length - continuous; pIdx++) {
            // Check if periods are contiguous numbers (e.g. 1,2,3 not 2,4,5)
            let isContiguous = true;
            for(let i=0; i<continuous-1; i++){
                if(classPeriods[pIdx + i + 1] - classPeriods[pIdx + i] !== 1){
                    isContiguous = false; break;
                }
            }
            if(!isContiguous) continue;

            let isFree = true
            for (let i = 0; i < continuous; i++) {
              const p = classPeriods[pIdx + i]
              if (
                semesterGrid[d][p] !== null || 
                facultyOccupied[d][p].has(assignment.faculty_id) ||
                (assignment.lab_id && labOccupied[d][p].has(assignment.lab_id))
              ) {
                isFree = false
                break
              }
            }

            if (isFree) {
              for (let i = 0; i < continuous; i++) {
                const p = classPeriods[pIdx + i]
                semesterGrid[d][p] = assignment
                facultyOccupied[d][p].add(assignment.faculty_id)
                if (assignment.lab_id) labOccupied[d][p].add(assignment.lab_id)
                newSlots.push({ day_of_week: d, period_number: p, subject_id: assignment.subject_id, faculty_id: assignment.faculty_id, lab_id: assignment.lab_id })
              }
              daysAssigned.add(d)
              remainingClasses -= continuous
              placed = true
              break
            }
          }
          if (placed) break
        }

        if (!placed && subjectType === 'Theory') {
          // Relax daysAssigned constraint
          for (const d of workingDays) {
            for (const p of classPeriods) {
              if (semesterGrid[d][p] === null && !facultyOccupied[d][p].has(assignment.faculty_id)) {
                semesterGrid[d][p] = assignment
                facultyOccupied[d][p].add(assignment.faculty_id)
                newSlots.push({ day_of_week: d, period_number: p, subject_id: assignment.subject_id, faculty_id: assignment.faculty_id, lab_id: assignment.lab_id })
                remainingClasses -= 1
                placed = true
                break
              }
            }
            if (placed) break
          }
        }

        if (!placed) {
          if (subjectType === 'Lab') throw new Error(`Scheduling Conflict! Could not find ${continuous} continuous free periods for Lab: ${(assignment.subjects as any).name}.`)
          else throw new Error(`Scheduling Conflict! Could not find a free slot for Theory: ${(assignment.subjects as any).name}.`)
        }
      }
      
      while (remainingClasses > 0) {
        let placed = false
        for (const d of workingDays) {
          for (const p of classPeriods) {
             if (semesterGrid[d][p] === null && !facultyOccupied[d][p].has(assignment.faculty_id) && !(assignment.lab_id && labOccupied[d][p].has(assignment.lab_id))) {
                semesterGrid[d][p] = assignment
                facultyOccupied[d][p].add(assignment.faculty_id)
                if (assignment.lab_id) labOccupied[d][p].add(assignment.lab_id)
                newSlots.push({ day_of_week: d, period_number: p, subject_id: assignment.subject_id, faculty_id: assignment.faculty_id, lab_id: assignment.lab_id })
                remainingClasses -= 1
                placed = true
                break
              }
          }
          if (placed) break
        }
        if (!placed) throw new Error(`Scheduling Conflict! Could not find a free slot for remaining hours of: ${(assignment.subjects as any).name}.`)
      }
    }

    // 5. Save to Database
    const { data: existingTb } = await supabase.from('timetables').select('id').eq('semester_id', semesterId).single()
    if (existingTb) await supabase.from('timetables').delete().eq('id', existingTb.id)

    const { data: newTb, error: tbErr } = await supabase.from('timetables').insert({ semester_id: semesterId, status: 'published' }).select('id').single()
    if (tbErr) throw new Error('Failed to create timetable record: ' + tbErr.message)

    const slotsToInsert = newSlots.map(s => ({ ...s, timetable_id: newTb.id }))
    const { error: insertErr } = await supabase.from('timetable_slots').insert(slotsToInsert)
    if (insertErr) throw new Error('Failed to save slots: ' + insertErr.message)

    revalidatePath('/timetable')
    return { success: true }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
