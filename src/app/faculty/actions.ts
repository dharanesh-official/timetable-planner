'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateFacultyProfile(id: string, updates: { weekly_hour_limit: number; department?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'timetable_planner') {
    return { error: 'Unauthorized. Only timetable planners can manage faculty details.' }
  }

  const updatePayload: any = {
    weekly_hour_limit: updates.weekly_hour_limit
  }

  if (updates.department !== undefined) {
    updatePayload.department = updates.department || null
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    console.error('Error updating faculty profile:', error)
    return { error: error.message }
  }

  revalidatePath('/faculty')
  revalidatePath('/manage-users')
  return { success: true }
}
