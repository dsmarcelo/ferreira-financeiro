'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createAccount(formData: FormData) {
  const adminPassword = formData.get('adminPassword') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Check admin password (in production, this should be stored securely)
  if (adminPassword !== '0000') {
    redirect('/admin/create-account?error=invalid_admin_password')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error creating account:', error)
    // Redirect to the create account page with an error message
    redirect('/admin/create-account?error=signup_failed')
  }

  revalidatePath('/admin/create-account')
  redirect('/admin/create-account?success=true')
}
