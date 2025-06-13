'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { env } from '@/env'
import { translateAuthError } from '@/utils/error-translations'

export interface CreateAccountResponse {
  error?: string
  success?: boolean
  message?: string
  email?: string
  adminPassword?: string
}

export async function createAccount(prevState: CreateAccountResponse | null, formData: FormData): Promise<CreateAccountResponse> {
  const adminPassword = formData.get('adminPassword') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const envAdminPassword = env.ADMIN_PASSWORD
  if (!envAdminPassword) {
    console.error('Admin password is not set in environment variables.')
    return { error: 'Senha de administrador não configurada no sistema.', email, adminPassword }
  }

  // Check admin password (in production, this should be stored securely)
  if (adminPassword !== envAdminPassword) {
    return { error: 'Senha de administrador incorreta.', email, adminPassword }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error creating account:', error)
    return { error: translateAuthError(error.message), email, adminPassword }
  }

  revalidatePath('/admin/criar-conta')
  return { success: true, message: 'Conta criada com sucesso!' }
}
