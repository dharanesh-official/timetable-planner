import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/SubmitButton'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { revalidatePath } from 'next/cache'

export default async function LabsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'timetable_planner') redirect('/')

  const { data: labs } = await supabase.from('labs').select('*').order('created_at', { ascending: false })

  async function createLab(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const supabase = await createClient()
    await supabase.from('labs').insert({ name })
    revalidatePath('/labs')
  }

  async function deleteLab(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = await createClient()
    await supabase.from('labs').delete().eq('id', id)
    revalidatePath('/labs')
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Manage Labs</h1>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-200">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Lab</h2>
        <form action={createLab} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Lab Name</label>
            <Input name="name" placeholder="e.g., Computer Lab 1" required className="border-slate-200 focus-visible:ring-blue-600 bg-slate-50/50" />
          </div>
          <SubmitButton defaultText="Add Lab" loadingText="Adding..." className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all rounded-lg" />
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Lab Name</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labs?.map((lab) => (
              <TableRow key={lab.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-900">{lab.name}</TableCell>
                <TableCell className="text-right">
                  <form action={deleteLab}>
                    <input type="hidden" name="id" value={lab.id} />
                    <SubmitButton defaultText="Delete" loadingText="Deleting..." variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" />
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {(!labs || labs.length === 0) && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-12 text-slate-500 bg-slate-50/30">No labs found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
