import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/SubmitButton'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { revalidatePath } from 'next/cache'

export default async function RegulationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'curriculum_designer') redirect('/')

  const { data: regulations } = await supabase.from('regulations').select('*').order('created_at', { ascending: false })

  async function createRegulation(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const supabase = await createClient()
    await supabase.from('regulations').insert({ name })
    revalidatePath('/regulations')
  }

  async function deleteRegulation(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = await createClient()
    await supabase.from('regulations').delete().eq('id', id)
    revalidatePath('/regulations')
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Regulations</h1>
          <p className="text-slate-600 mt-1">Manage academic regulations for the institution.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Add Regulation</h2>
        <form action={createRegulation} className="flex gap-4">
          <Input name="name" placeholder="e.g., Regulation 2024" required className="max-w-md bg-white border-slate-200 focus-visible:ring-blue-600" />
          <SubmitButton defaultText="Add" loadingText="Adding..." className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg" />
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Created At</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regulations?.map((reg) => (
              <TableRow key={reg.id} className="hover:bg-slate-50/50">
                <TableCell className="font-bold text-slate-800">{reg.name}</TableCell>
                <TableCell>{new Date(reg.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <form action={deleteRegulation}>
                    <input type="hidden" name="id" value={reg.id} />
                    <SubmitButton defaultText="Delete" loadingText="Deleting..." variant="destructive" size="sm" className="shadow-sm" />
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {regulations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">No regulations found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
