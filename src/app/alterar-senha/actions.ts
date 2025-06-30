'use server'

// import { translateAuthError } from '@/utils/error-translations' // Unused for now
import { getCurrentUser } from '@/utils/auth'
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export interface ActionResponse {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export async function changePassword(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  try {
    // Validate form data
    const validatedData = changePasswordSchema.parse({
      currentPassword,
      newPassword,
      confirmPassword,
    })

    // Get current authenticated user
    const user = await getCurrentUser()
    if (!user?.email) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
        errors: {
          currentPassword: ['Usuário não encontrado.']
        },
        currentPassword,
        newPassword,
        confirmPassword
      }
    }

    // Get user from database to verify current password
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1)

    const dbUser = userResult[0]
    if (!dbUser?.password) {
      return {
        success: false,
        message: 'Usuário não encontrado ou senha não configurada.',
        errors: {
          currentPassword: ['Usuário não encontrado ou senha não configurada.']
        },
        currentPassword,
        newPassword,
        confirmPassword
      }
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(validatedData.currentPassword, dbUser.password)
    if (!passwordMatch) {
      return {
        success: false,
        message: 'Senha atual incorreta.',
        errors: {
          currentPassword: ['Senha atual incorreta.']
        },
        currentPassword,
        newPassword,
        confirmPassword
      }
    }

    // Hash the new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, saltRounds)

    // Update password in database
    await db
      .update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.email, user.email))

    console.log('Password changed successfully for user:', user.email)

    return {
      success: true,
      message: 'Senha alterada com sucesso!'
    }

  } catch (error) {
    console.error('Error changing password:', error)

        if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors)[0]?.[0]

      // Convert fieldErrors to match the expected type
      const processedErrors: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(fieldErrors)) {
        if (value) {
          processedErrors[key] = value
        }
      }

      return {
        success: false,
        message: firstError ?? 'Dados inválidos fornecidos.',
        errors: processedErrors,
        currentPassword,
        newPassword,
        confirmPassword
      }
    }

    return {
      success: false,
      message: 'Erro interno do servidor. Tente novamente mais tarde.',
      errors: {
        currentPassword: ['Erro interno do servidor.']
      },
      currentPassword,
      newPassword,
      confirmPassword
    }
  }
}