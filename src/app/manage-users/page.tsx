import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CreateUserForm from './CreateUserForm'
import UserTableClient from './UserTableClient'

export default async function ManageUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  
  if (profile?.role !== 'super_admin' && profile?.role !== 'timetable_planner') {
    redirect('/')
  }

  // Fetch users based on role
  let targetRoles: string[] = []
  if (profile.role === 'super_admin') {
    targetRoles = ['timetable_planner']
  } else if (profile.role === 'timetable_planner') {
    targetRoles = ['curriculum_designer', 'faculty']
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .in('role', targetRoles)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-600 mt-1">Create and view {profile.role === 'super_admin' ? 'Timetable Planners' : 'Faculty and Curriculum Designers'}</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-200">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Create New User</h2>
        <CreateUserForm currentUserRole={profile.role} />
      </div>

      <UserTableClient initialUsers={users || []} />
    </div>
  )
}
