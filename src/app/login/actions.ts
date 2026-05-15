'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // redirect to an error page or return an error message
    console.error('Login error', error)
    redirect('/login?error=' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role,
      }
    }
  })

  if (error) {
    console.error('Signup error', error)
    redirect('/login?error=' + error.message)
  }

  // Manually insert into profiles as the trigger might not be set up yet
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
      full_name,
      role
    }).select().single()
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
