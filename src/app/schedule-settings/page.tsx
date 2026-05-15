import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScheduleSettingsClient from './ScheduleSettingsClient'

export default async function ScheduleSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'timetable_planner') redirect('/')

  // Fetch data
  const { data: workingDays } = await supabase.from('working_days').select('*').order('day_of_week')
  const { data: timeSlots } = await supabase.from('time_slots').select('*').order('period_number')

  return <ScheduleSettingsClient initialWorkingDays={workingDays || []} initialTimeSlots={timeSlots || []} />
}
