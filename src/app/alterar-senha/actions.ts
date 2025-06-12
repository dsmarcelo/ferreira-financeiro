'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha deve ter pelo menos 6 caracteres'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export type ActionResponse = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

export async function changePassword(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
  try {
    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    // Validate the form data
    const validatedData = changePasswordSchema.safeParse(rawData)

    if (!validatedData.success) {
      return {
        success: false,
        message: 'Por favor, corrija os erros no formulário',
        errors: validatedData.error.flatten().fieldErrors,
      }
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        message: 'Usuário não autenticado',
      }
    }

    // First, verify the current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validatedData.data.currentPassword,
    })

    if (verifyError) {
      return {
        success: false,
        message: 'Senha atual incorreta',
        errors: {
          currentPassword: ['Senha atual incorreta']
        }
      }
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.data.newPassword
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return {
        success: false,
        message: 'Erro ao alterar senha. Tente novamente.',
      }
    }

    revalidatePath('/alterar-senha')

    return {
      success: true,
      message: 'Senha alterada com sucesso!',
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      message: 'Erro inesperado ao alterar senha',
    }
  }
}
