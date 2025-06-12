'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { env } from '@/env'
import { translateAuthError } from '@/utils/error-translations'

export async function createAccount(prevState: string | null, formData: FormData): Promise<string | null> {
  const adminPassword = formData.get('adminPassword') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const envAdminPassword = env.ADMIN_PASSWORD
  if (!envAdminPassword) {
    console.error('Admin password is not set in environment variables.')
    return 'missing_admin_password'
  }

  // Check admin password (in production, this should be stored securely)
  if (adminPassword !== envAdminPassword) {
    return 'invalid_admin_password'
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error creating account:', error)
    return translateAuthError(error.message)
  }

  revalidatePath('/admin/criar-conta')
  return 'success'
}
