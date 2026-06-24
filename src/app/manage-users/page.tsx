import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createUser } from './actions'
import CreateUserForm from './CreateUserForm'
import DeleteUserButton from './DeleteUserButton'

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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Email</TableHead>
              <TableHead className="font-semibold text-slate-700">Role</TableHead>
              <TableHead className="font-semibold text-slate-700">Weekly Limit</TableHead>
              <TableHead className="font-semibold text-slate-700">Created At</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u) => (
              <TableRow key={u.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-900">{u.full_name}</TableCell>
                <TableCell className="text-slate-600">{u.email}</TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold tracking-wide uppercase border border-blue-100">
                    {u.role.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-slate-600 font-medium">
                  {u.role === 'faculty' ? `${u.weekly_hour_limit ?? 20} hrs` : '-'}
                </TableCell>
                <TableCell className="text-slate-600">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DeleteUserButton userId={u.id} role={u.role} />
                </TableCell>
              </TableRow>
            ))}
            {(!users || users.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500 bg-slate-50/30">
                  No users found matching your permission scope.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
