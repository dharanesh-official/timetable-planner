import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import FacultyListClient from './FacultyListClient'

export default async function FacultyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'timetable_planner') redirect('/')

  // View all faculty members (including curriculum designers/planners)
  const { data: facultyMembers } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['faculty', 'curriculum_designer'])
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Faculty Members</h1>
          <p className="text-slate-600 mt-1">View and manage registered faculty members and their weekly constraints.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <p className="text-slate-600 leading-relaxed">
          As a timetable planner, you can view all registered faculty members here. You can also assign their departments and configure their weekly hour limits inline, which will be strictly enforced during timetable generation.
        </p>
      </div>

      <FacultyListClient initialFacultyMembers={facultyMembers || []} />
    </div>
  )
}
