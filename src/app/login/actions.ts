'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  console.log('Logging in with data:', data)
  // Get the redirectTo parameter from formData or default to '/'
  // This is useful for redirecting users back to the page they were trying to access

  const redirectTo = formData.get('redirectTo') as string

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Error logging in:', error)
    // Redirect to an error page or show a message
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  // Redirect to the original URL or home page
  redirect(redirectTo || '/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Error signing up:', error)
    // Redirect to an error page or show a message
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
