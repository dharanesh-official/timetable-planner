'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { X } from 'lucide-react'

export default function AssignmentsClient({
  regulations,
  batches,
  semesters,
  subjects,
  faculties,
  labs,
  workingDays,
  timeSlots,
  initialAssignments
}: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [selectedReg, setSelectedReg] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  
  // Stores draft assignments: { subjectId: { facultyId, labId, classesPerWeek, continuousHours, fixedSlots } }
  const [draftAssignments, setDraftAssignments] = useState<Record<string, { facultyId: string, labId: string, classesPerWeek: number | '', continuousHours: number | '', fixedSlots: any[] }>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [fixedSlotModal, setFixedSlotModal] = useState<{ isOpen: boolean, subjectId: string | null }>({ isOpen: false, subjectId: null })

  const filteredBatches = batches.filter((b: any) => b.regulation_id === selectedReg)
  const filteredSemesters = semesters.filter((s: any) => s.batch_id === selectedBatch)
  const filteredSubjects = subjects.filter((s: any) => s.semester_id === selectedSemester)

  // Pre-fill drafts from database when semester is selected
  const handleSemesterSelect = (semesterId: string) => {
    setSelectedSemester(semesterId)
    const existing = initialAssignments.filter((a: any) => 
      subjects.find((s: any) => s.id === a.subject_id)?.semester_id === semesterId
    )
    
    const drafts: Record<string, any> = {}
    existing.forEach((a: any) => {
      drafts[a.subject_id] = { 
        facultyId: a.faculty_id, 
        labId: a.lab_id || '',
        classesPerWeek: a.classes_per_week,
        continuousHours: a.continuous_hours || 1,
        fixedSlots: a.fixed_slots || []
      }
    })
    setDraftAssignments(drafts)
  }

  const handleDraftChange = (subjectId: string, field: 'facultyId' | 'labId' | 'classesPerWeek' | 'continuousHours' | 'fixedSlots', value: any) => {
    setDraftAssignments(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }))
  }

  const toggleFixedSlot = (subjectId: string, day_of_week: number, period_number: number) => {
    const currentSlots = draftAssignments[subjectId]?.fixedSlots || []
    const exists = currentSlots.some((s: any) => s.day_of_week === day_of_week && s.period_number === period_number)
    const newSlots = exists 
      ? currentSlots.filter((s: any) => !(s.day_of_week === day_of_week && s.period_number === period_number))
      : [...currentSlots, { day_of_week, period_number }]
    
    handleDraftChange(subjectId, 'fixedSlots', newSlots)
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      // Validation Check
      for (const [subjectId, data] of Object.entries(draftAssignments)) {
        if (data.facultyId && data.classesPerWeek) {
          const subject = subjects.find((s: any) => s.id === subjectId)
          if (subject?.type === 'Lab') {
            const continuous = Number(data.continuousHours) || 1
            const total = Number(data.classesPerWeek)
            if (continuous > total) {
              throw new Error(`For Lab subject ${subject.name}, continuous hours (${continuous}) cannot exceed total hours per week (${total}).`)
            }
            if (!data.labId) {
              throw new Error(`Please select a Lab facility for the Lab subject: ${subject.name}`)
            }
          }
        }
      }

      // 1. Delete existing mappings for this semester's subjects
      const subjectIds = filteredSubjects.map((s: any) => s.id)
      if (subjectIds.length > 0) {
        await supabase.from('subject_faculty_mapping').delete().in('subject_id', subjectIds)
      }

      // 2. Insert new mappings
      const newMappings = Object.entries(draftAssignments)
        .filter(([_, data]) => data.facultyId && data.classesPerWeek)
        .map(([subjectId, data]) => {
          const subject = subjects.find((s: any) => s.id === subjectId)
          return {
            subject_id: subjectId,
            faculty_id: data.facultyId,
            lab_id: subject?.type === 'Lab' && data.labId ? data.labId : null,
            classes_per_week: Number(data.classesPerWeek),
            continuous_hours: subject?.type === 'Lab' ? (Number(data.continuousHours) || 1) : 1,
            fixed_slots: data.fixedSlots || []
          }
        })

      if (newMappings.length > 0) {
        const { error } = await supabase.from('subject_faculty_mapping').insert(newMappings)
        if (error) throw error
      }
      
      alert('Assignments saved successfully!')
    } catch (error: any) {
      alert('Error saving assignments: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateTimetable = async () => {
    if (!selectedSemester) return
    setIsGenerating(true)
    try {
      // Check if timetable already exists to prevent accidental duplicate overwrites
      const { data: existingTb } = await supabase
        .from('timetables')
        .select('id')
        .eq('semester_id', selectedSemester)
        .single()

      if (existingTb) {
        const confirmOverwrite = window.confirm(
          'A timetable already exists for this semester. Generating a new one will completely overwrite the existing schedule. Are you sure you want to proceed?'
        )
        if (!confirmOverwrite) {
          setIsGenerating(false)
          return
        }
      }

      const { generateTimetable } = await import('@/app/actions/timetable')
      const result = await generateTimetable(selectedSemester)
      if (result.success) {
        alert('Timetable generated successfully!')
        window.location.href = `/timetable?semester=${selectedSemester}`
      } else {
        alert(result.error)
      }
    } catch (err: any) {
      alert('Generation Failed: ' + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Design TT</h1>
        <p className="text-slate-600 mt-1">Select the configuration to assign faculty to curriculum subjects.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Step 1: Select Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col space-y-2">
            <Label className="text-slate-700 font-semibold">Regulation</Label>
            <select 
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
              value={selectedReg} 
              onChange={(e) => { setSelectedReg(e.target.value); setSelectedBatch(''); setSelectedSemester(''); }}
            >
              <option value="" disabled>Select Regulation</option>
              {regulations.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label className="text-slate-700 font-semibold">Batch</Label>
            <select 
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedReg} 
              value={selectedBatch} 
              onChange={(e) => { setSelectedBatch(e.target.value); setSelectedSemester(''); }}
            >
              <option value="" disabled>Select Batch</option>
              {filteredBatches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label className="text-slate-700 font-semibold">Semester</Label>
            <select 
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedBatch} 
              value={selectedSemester} 
              onChange={(e) => handleSemesterSelect(e.target.value)}
            >
              <option value="" disabled>Select Semester</option>
              {filteredSemesters.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedSemester && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">Step 2: Assign Faculty & Hours</h2>
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <Button onClick={handleSaveAll} disabled={isSaving} variant="outline" className="border-slate-200 shadow-sm flex-1 sm:flex-none">
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button onClick={handleGenerateTimetable} disabled={isGenerating || isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all rounded-lg flex-1 sm:flex-none">
                {isGenerating ? 'Generating...' : 'Generate Timetable'}
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Code & Name</TableHead>
                <TableHead className="w-[100px] font-semibold text-slate-700">Type</TableHead>
                <TableHead className="w-[350px] font-semibold text-slate-700">Assignments (Faculty / Lab)</TableHead>
                <TableHead className="w-[120px] font-semibold text-slate-700">Hours/Week</TableHead>
                <TableHead className="w-[150px] font-semibold text-slate-700">Continuous Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject: any) => {
                const draft = draftAssignments[subject.id] || { facultyId: '', labId: '', classesPerWeek: '', continuousHours: '', fixedSlots: [] }
                const isLab = subject.type === 'Lab'

                return (
                  <TableRow key={subject.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-bold text-blue-700">{subject.code}</div>
                      <div className="text-sm text-slate-600 font-medium">{subject.name} ({subject.credits} CR)</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase border ${isLab ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                        {subject.type || 'Theory'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <select 
                          className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
                          value={draft.facultyId || ''} 
                          onChange={(e) => handleDraftChange(subject.id, 'facultyId', e.target.value)}
                        >
                          <option value="" disabled>Select Faculty</option>
                          {faculties.map((f: any) => (
                            <option key={f.id} value={f.id}>{f.full_name}</option>
                          ))}
                        </select>

                        {isLab && (
                          <select 
                            className="flex h-10 w-full rounded-lg border border-cyan-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 shadow-sm"
                            value={draft.labId || ''} 
                            onChange={(e) => handleDraftChange(subject.id, 'labId', e.target.value)}
                          >
                            <option value="" disabled>Select Lab Facility</option>
                            {labs.map((l: any) => (
                              <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                            {labs.length === 0 && <option value="none" disabled>No labs created yet</option>}
                          </select>
                        )}
                        {draft.facultyId && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setFixedSlotModal({ isOpen: true, subjectId: subject.id })}
                            className="w-fit text-xs h-7 border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {draft.fixedSlots?.length > 0 ? `${draft.fixedSlots.length} Fixed Slots` : '+ Set Fixed Slots'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="e.g. 3"
                        value={draft.classesPerWeek || ''}
                        onChange={(e) => handleDraftChange(subject.id, 'classesPerWeek', parseInt(e.target.value) || '')}
                        className="bg-white border-slate-200 shadow-sm rounded-lg focus-visible:ring-blue-600"
                      />
                    </TableCell>
                    <TableCell>
                      {isLab ? (
                        <div className="relative">
                          <Input 
                            type="number" 
                            min="1"
                            max={draft.classesPerWeek || 10}
                            placeholder="e.g. 2"
                            value={draft.continuousHours || ''}
                            onChange={(e) => handleDraftChange(subject.id, 'continuousHours', parseInt(e.target.value) || '')}
                            className={`pr-12 bg-white shadow-sm rounded-lg ${Number(draft.continuousHours) > Number(draft.classesPerWeek) ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-blue-600'}`}
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">hrs</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 font-medium italic">Theory (1 hr slots)</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredSubjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 bg-slate-50/30">
                    No subjects found for this semester. The Curriculum Planner needs to add subjects first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {fixedSlotModal.isOpen && fixedSlotModal.subjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Select Fixed Slots</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {subjects.find((s: any) => s.id === fixedSlotModal.subjectId)?.name} 
                  - Faculty: {faculties.find((f: any) => f.id === draftAssignments[fixedSlotModal.subjectId]?.facultyId)?.full_name}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFixedSlotModal({ isOpen: false, subjectId: null })} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50/20">
              <div className="mb-4 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">ℹ️</span>
                <p>Click on the grid cells to fix the specific slots where the selected faculty is available. The algorithm will strictly place this subject's classes only in the highlighted slots.</p>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-r border-slate-200 bg-slate-50 p-3 text-center text-sm font-semibold text-slate-700 w-32">Day / Time</th>
                      {timeSlots.map((p: any) => (
                        <th key={p.id} className="border-b border-r border-slate-200 bg-slate-50 p-3 text-center w-28">
                          <div className="font-bold text-slate-800 text-xs">{p.type === 'Class' ? `Period ${p.period_number}` : p.type}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {workingDays.map((day: any) => (
                      <tr key={day.id}>
                        <td className="border-b border-r border-slate-200 bg-slate-50 p-3 text-center font-bold text-sm text-slate-800">
                          {day.name}
                        </td>
                        {timeSlots.map((period: any) => {
                          if (period.type === 'Break' || period.type === 'Lunch') {
                            return (
                              <td key={period.id} className="border-b border-r border-slate-200 bg-slate-50/50 p-2 text-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.02)_8px,rgba(0,0,0,0.02)_16px)]" />
                              </td>
                            )
                          }

                          const isSelected = (draftAssignments[fixedSlotModal.subjectId]?.fixedSlots || []).some(
                            (s: any) => s.day_of_week === day.day_of_week && s.period_number === period.period_number
                          )
                          
                          return (
                            <td 
                              key={period.id} 
                              className={`border-b border-r border-slate-200 p-1 cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 hover:bg-blue-200' : 'bg-white hover:bg-slate-50'}`}
                              onClick={() => toggleFixedSlot(fixedSlotModal.subjectId!, day.day_of_week, period.period_number)}
                            >
                              <div className={`w-full h-12 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'border-blue-300 shadow-inner' : 'border-dashed border-slate-200'}`}>
                                {isSelected && <span className="text-blue-600 font-bold text-lg">✓</span>}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end bg-white">
              <Button onClick={() => setFixedSlotModal({ isOpen: false, subjectId: null })} className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
