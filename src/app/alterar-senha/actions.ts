'use server'

import { createClient } from '@/utils/supabase/server'
import { translateAuthError } from '@/utils/error-translations'

export interface ActionResponse {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function changePassword(formData: FormData): Promise<ActionResponse> {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    return {
      success: false,
      message: 'As senhas não coincidem.',
      errors: {
        confirmPassword: ['As senhas não coincidem.']
      }
    }
  }

  // Validate password length
  if (newPassword.length < 6) {
    return {
      success: false,
      message: 'A senha deve ter pelo menos 6 caracteres.',
      errors: {
        newPassword: ['A senha deve ter pelo menos 6 caracteres.']
      }
    }
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return {
      success: false,
      message: 'Usuário não encontrado.',
      errors: {
        currentPassword: ['Usuário não encontrado.']
      }
    }
  }

  // First, verify the current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return {
      success: false,
      message: translateAuthError(signInError.message),
      errors: {
        currentPassword: [translateAuthError(signInError.message)]
      }
    }
  }

  // Update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) {
    return {
      success: false,
      message: translateAuthError(updateError.message),
      errors: {
        newPassword: [translateAuthError(updateError.message)]
      }
    }
  }

  return {
    success: true,
    message: 'Senha alterada com sucesso!'
  }
}
