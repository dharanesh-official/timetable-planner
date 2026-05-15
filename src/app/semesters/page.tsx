import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { revalidatePath } from 'next/cache'

export default async function SemestersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'curriculum_designer') redirect('/')

  const { data: batches } = await supabase.from('batches').select('*, regulations(name)').order('created_at', { ascending: false })
  const { data: semesters } = await supabase.from('semesters').select('*, batches(name, regulations(name))').order('created_at', { ascending: false })

  async function createSemester(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const batch_id = formData.get('batch_id') as string
    const supabase = await createClient()
    await supabase.from('semesters').insert({ name, batch_id })
    revalidatePath('/semesters')
  }

  async function deleteSemester(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = await createClient()
    await supabase.from('semesters').delete().eq('id', id)
    revalidatePath('/semesters')
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Semesters</h1>
          <p className="text-slate-600 mt-1">Manage academic semesters for each batch.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Add Semester</h2>
        <form action={createSemester} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Batch</label>
            <select 
              name="batch_id" 
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
            >
              <option value="" disabled selected hidden>Select Batch</option>
              {batches?.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.regulations?.name})</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Semester Name</label>
            <select 
              name="name" 
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
            >
              <option value="" disabled selected hidden>Select Semester</option>
              <option value="Odd Semester">Odd Semester</option>
              <option value="Even Semester">Even Semester</option>
            </select>
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg">Add</Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Semester Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Batch</TableHead>
              <TableHead className="font-semibold text-slate-700">Regulation</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesters?.map((sem) => (
              <TableRow key={sem.id} className="hover:bg-slate-50/50">
                <TableCell className="font-bold text-slate-800">{sem.name}</TableCell>
                <TableCell>{sem.batches?.name}</TableCell>
                <TableCell>{sem.batches?.regulations?.name}</TableCell>
                <TableCell className="text-right">
                  <form action={deleteSemester}>
                    <input type="hidden" name="id" value={sem.id} />
                    <Button variant="destructive" size="sm" type="submit" className="shadow-sm">Delete</Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {semesters?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No semesters found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
