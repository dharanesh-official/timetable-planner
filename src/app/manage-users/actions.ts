'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  const targetRole = formData.get('role') as string

  // Permission validation
  if (profile?.role === 'super_admin' && targetRole !== 'timetable_planner') {
    return { error: 'Super Admin can only create Timetable Planners' }
  }

  if (profile?.role === 'timetable_planner' && !['curriculum_designer', 'faculty'].includes(targetRole)) {
    return { error: 'Timetable Planner can only create Curriculum Designers and Faculty' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string

  const adminAuthClient = createAdminClient()

  // Use Admin API to create the user so it doesn't log out the current user
  const { data: newUser, error } = await adminAuthClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role: targetRole
    }
  })

  if (error) {
    console.error('Error creating user:', error)
    return { error: error.message }
  }

  if (newUser.user) {
    const weeklyHourLimitVal = formData.get('weekly_hour_limit')
    const weekly_hour_limit = weeklyHourLimitVal ? parseInt(weeklyHourLimitVal as string, 10) : 20

    // Insert profile manually
    const { error: profileError } = await adminAuthClient.from('profiles').insert({
      id: newUser.user.id,
      email: newUser.user.email,
      full_name,
      role: targetRole,
      weekly_hour_limit: targetRole === 'faculty' ? weekly_hour_limit : null
    })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return { error: profileError.message }
    }
  }

  revalidatePath('/manage-users')
  return { success: true }
}

export async function deleteUser(userId: string, targetRole: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  // Permission validation
  if (profile?.role === 'super_admin' && targetRole !== 'timetable_planner') {
    return { error: 'Super Admin can only delete Timetable Planners' }
  }

  if (profile?.role === 'timetable_planner' && !['curriculum_designer', 'faculty'].includes(targetRole)) {
    return { error: 'Timetable Planner can only delete Curriculum Designers and Faculty' }
  }

  const adminAuthClient = createAdminClient()
  const { error } = await adminAuthClient.auth.admin.deleteUser(userId)

  if (error) {
    console.error('Error deleting user:', error)
    return { error: error.message }
  }

  revalidatePath('/manage-users')
  return { success: true }
}
