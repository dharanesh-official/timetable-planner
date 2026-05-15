import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-sm">
              T
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700 font-semibold">
                {profile?.full_name}
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold tracking-wide uppercase border border-blue-100">
                {profile?.role?.replace('_', ' ')}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit" className="text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            
            {profile?.role === 'super_admin' && (
              <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-slate-200 border-l-4 border-l-blue-600 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <svg className="w-24 h-24 text-blue-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome to the Super Admin Portal</h2>
                <p className="text-slate-600 text-lg max-w-2xl">Use the sidebar on the left to manage global settings, oversee system operations, and securely provision new Timetable Planners.</p>
              </div>
            )}

            {profile?.role === 'curriculum_designer' && (
              <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-slate-200 border-l-4 border-l-blue-600 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <svg className="w-24 h-24 text-blue-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome, Curriculum Designer!</h2>
                <p className="text-slate-600 text-lg max-w-2xl">Use the sidebar on the left to seamlessly manage academic regulations, student batches, semesters, and curriculum subject structures.</p>
              </div>
            )}
            
            {profile?.role === 'timetable_planner' && (
              <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-slate-200 border-l-4 border-l-blue-600 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <svg className="w-24 h-24 text-blue-900" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome to the Planning Module</h2>
                <p className="text-slate-600 text-lg max-w-2xl">Use the sidebar on the left to securely manage user accounts, assign faculty members to specific subjects, and instantly generate conflict-free timetables.</p>
              </div>
            )}

            {profile?.role === 'faculty' && (
              <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-slate-200 border-l-4 border-l-blue-600 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <svg className="w-24 h-24 text-blue-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome, Faculty Member!</h2>
                <p className="text-slate-600 text-lg max-w-2xl">Use the sidebar on the left to view your personalized weekly schedule and securely update your availability constraints.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
