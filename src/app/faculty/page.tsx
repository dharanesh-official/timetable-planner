import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function FacultyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'timetable_planner') redirect('/')

  // View all faculty members
  const { data: facultyMembers } = await supabase.from('profiles').select('*').eq('role', 'faculty').order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Faculty Members</h1>
          <p className="text-slate-600 mt-1">View all registered faculty members in the system.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <p className="text-slate-600">
          Faculty members can sign up themselves. As a timetable planner, you can view the available faculty members here. In future phases, you will be able to manage their department and mapping.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Email</TableHead>
              <TableHead className="font-semibold text-slate-700">Department</TableHead>
              <TableHead className="font-semibold text-slate-700">Joined At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facultyMembers?.map((faculty) => (
              <TableRow key={faculty.id} className="hover:bg-slate-50/50">
                <TableCell className="font-bold text-slate-800">{faculty.full_name}</TableCell>
                <TableCell className="text-slate-600">{faculty.email}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-700">
                    {faculty.department || 'Not Assigned'}
                  </span>
                </TableCell>
                <TableCell className="text-slate-500">{new Date(faculty.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {facultyMembers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No faculty members found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
