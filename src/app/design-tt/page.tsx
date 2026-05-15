import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AssignmentsClient from './AssignmentsClient'

export default async function AssignmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'timetable_planner') {
    redirect('/dashboard')
  }

  // Fetch all necessary data
  const { data: regulations } = await supabase.from('regulations').select('*').order('created_at', { ascending: false })
  const { data: batches } = await supabase.from('batches').select('*').order('created_at', { ascending: false })
  const { data: semesters } = await supabase.from('semesters').select('*').order('created_at', { ascending: false })
  const { data: subjects } = await supabase.from('subjects').select('*').order('created_at', { ascending: false })
  const { data: faculties } = await supabase.from('profiles').select('*').in('role', ['faculty', 'timetable_planner', 'curriculum_designer']).order('full_name', { ascending: true })
  const { data: labs } = await supabase.from('labs').select('*').order('name', { ascending: true })
  const { data: workingDays } = await supabase.from('working_days').select('*').eq('is_working', true).order('day_of_week', { ascending: true })
  const { data: timeSlots } = await supabase.from('time_slots').select('*').order('period_number', { ascending: true })
  
  const { data: assignments } = await supabase
    .from('subject_faculty_mapping')
    .select(`
      id,
      classes_per_week,
      continuous_hours,
      lab_id,
      subject_id,
      faculty_id,
      fixed_slots,
      subjects(name, code, classes_per_week),
      profiles(full_name, email)
    `)
    .order('created_at', { ascending: false })

  return (
    <AssignmentsClient 
      regulations={regulations || []}
      batches={batches || []}
      semesters={semesters || []}
      subjects={subjects || []}
      faculties={faculties || []}
      labs={labs || []}
      workingDays={workingDays || []}
      timeSlots={timeSlots || []}
      initialAssignments={assignments || []}
    />
  )
}
