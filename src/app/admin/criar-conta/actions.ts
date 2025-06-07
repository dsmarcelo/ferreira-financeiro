'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { env } from '@/env'

export async function createAccount(formData: FormData) {
  const adminPassword = formData.get('adminPassword') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const envAdminPassword = env.ADMIN_PASSWORD
  if (!envAdminPassword) {
    console.error('Admin password is not set in environment variables.')
    {}
  if (!envAdminPassword) {
    console.error('Admin password is not set in environment variables.')
    redirect('/admin/criar-conta?error=missing_admin_password')
  }

  // Check admin password (in production, this should be stored securely)
  if (adminPassword !== envAdminPassword) {
    redirect('/admin/criar-conta?error=invalid_admin_password')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error creating account:', error)
    // Redirect to the create account page with an error message
    redirect('/admin/criar-conta?error=signup_failed')
  }

  revalidatePath('/admin/criar-conta')
  redirect('/admin/criar-conta?success=true')
}
}
