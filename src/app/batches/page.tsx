import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { revalidatePath } from 'next/cache'

export default async function BatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'curriculum_designer') redirect('/')

  const { data: regulations } = await supabase.from('regulations').select('*').order('created_at', { ascending: false })
  const { data: batches } = await supabase.from('batches').select('*, regulations(name)').order('created_at', { ascending: false })

  async function createBatch(formData: FormData) {
    'use server'
    let name = formData.get('name') as string
    name = name?.trim() || ''
    
    // If the user only types a number (like "24"), append " Batch" automatically
    if (/^\d+$/.test(name)) {
      name = `${name} Batch`
    }

    const regulation_id = formData.get('regulation_id') as string
    const supabase = await createClient()
    await supabase.from('batches').insert({ name, regulation_id })
    revalidatePath('/batches')
  }

  async function deleteBatch(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = await createClient()
    await supabase.from('batches').delete().eq('id', id)
    revalidatePath('/batches')
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Batches</h1>
          <p className="text-slate-600 mt-1">Manage student batches assigned to regulations.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Add Batch</h2>
        <form action={createBatch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Regulation</label>
            <select 
              name="regulation_id" 
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
            >
              <option value="" disabled selected hidden>Select Regulation</option>
              {regulations?.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Batch Name</label>
            <Input name="name" placeholder="e.g., 2024 Batch" required className="bg-white border-slate-200 focus-visible:ring-blue-600 shadow-sm rounded-lg" />
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg">Add</Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Batch Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Regulation</TableHead>
              <TableHead className="font-semibold text-slate-700">Created At</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches?.map((batch) => (
              <TableRow key={batch.id} className="hover:bg-slate-50/50">
                <TableCell className="font-bold text-slate-800">{batch.name}</TableCell>
                <TableCell>{batch.regulations?.name}</TableCell>
                <TableCell>{new Date(batch.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <form action={deleteBatch}>
                    <input type="hidden" name="id" value={batch.id} />
                    <Button variant="destructive" size="sm" type="submit" className="shadow-sm">Delete</Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {batches?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No batches found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
