import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubjectsClient from './SubjectsClient'

export default async function SubjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'curriculum_designer') redirect('/')

  // Fetch all necessary progressive selection data
  const { data: regulations } = await supabase.from('regulations').select('*').order('created_at', { ascending: false })
  const { data: batches } = await supabase.from('batches').select('*').order('created_at', { ascending: false })
  const { data: semesters } = await supabase.from('semesters').select('*').order('created_at', { ascending: false })
  const { data: subjects } = await supabase.from('subjects').select('*').order('created_at', { ascending: false })

  return <SubjectsClient 
    regulations={regulations || []} 
    batches={batches || []} 
    semesters={semesters || []} 
    initialSubjects={subjects || []} 
  />
}
