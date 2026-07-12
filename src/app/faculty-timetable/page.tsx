import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FacultyTimetableClient from './FacultyTimetableClient'

export default async function FacultyTimetablePage({ searchParams }: { searchParams: Promise<{ faculty_id?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['timetable_planner', 'faculty', 'curriculum_designer'].includes(profile.role)) {
    redirect('/')
  }

  // Fetch structure
  const { data: workingDays } = await supabase.from('working_days').select('*').eq('is_working', true).order('day_of_week')
  const { data: timeSlots } = await supabase.from('time_slots').select('*').order('period_number')
  
  // Fetch all faculty for dropdown if timetable_planner
  let facultyMembers: any[] = []
  if (profile.role === 'timetable_planner') {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['faculty', 'curriculum_designer'])
      .order('full_name')
    facultyMembers = data || []
  }

  let targetFacultyId = null
  if (profile.role === 'faculty' || profile.role === 'curriculum_designer') targetFacultyId = user.id
  else if (params.faculty_id) targetFacultyId = params.faculty_id

  let slots: any[] = []
  if (targetFacultyId) {
    const { data } = await supabase
      .from('timetable_slots')
      .select(`
        day_of_week,
        period_number,
        subjects(name, code, type),
        labs(name),
        timetables(
          semesters(
            name,
            batches(
              name,
              regulations(name)
            )
          )
        )
      `)
      .eq('faculty_id', targetFacultyId)
    
    slots = data || []
  }

  return (
    <FacultyTimetableClient 
      role={profile.role}
      facultyMembers={facultyMembers}
      workingDays={workingDays || []}
      timeSlots={timeSlots || []}
      slots={slots}
      selectedFacultyId={targetFacultyId}
    />
  )
}
