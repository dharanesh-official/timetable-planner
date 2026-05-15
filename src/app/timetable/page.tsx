import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TimetableClient from './TimetableClient'

export default async function TimetablePage({ searchParams }: { searchParams: Promise<{ semester?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'timetable_planner') redirect('/')

  // Fetch regulations, batches, semesters for the dropdowns
  const { data: regulations } = await supabase.from('regulations').select('*').order('created_at', { ascending: false })
  const { data: batches } = await supabase.from('batches').select('*').order('created_at', { ascending: false })
  const { data: semesters } = await supabase.from('semesters').select('*').order('created_at', { ascending: false })

  const { data: workingDays } = await supabase.from('working_days').select('*').eq('is_working', true).order('day_of_week')
  const { data: timeSlots } = await supabase.from('time_slots').select('*').order('period_number')

  let slots: any[] = []
  if (params.semester) {
    const { data: timetable } = await supabase
      .from('timetables')
      .select('id')
      .eq('semester_id', params.semester)
      .single()

    if (timetable) {
      const { data } = await supabase
        .from('timetable_slots')
        .select(`
          day_of_week,
          period_number,
          subjects(name, code, type),
          profiles(full_name),
          labs(name)
        `)
        .eq('timetable_id', timetable.id)
      slots = data || []
    }
  }

  return (
    <TimetableClient 
      regulations={regulations || []}
      batches={batches || []}
      semesters={semesters || []}
      initialSemester={params.semester}
      slots={slots}
      workingDays={workingDays || []}
      timeSlots={timeSlots || []}
    />
  )
}
