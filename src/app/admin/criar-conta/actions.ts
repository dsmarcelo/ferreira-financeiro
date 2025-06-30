'use server'

import { revalidatePath } from 'next/cache'
import { env } from '@/env'
// import { translateAuthError } from '@/utils/error-translations' // Unused for now
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export interface CreateAccountResponse {
  error?: string
  success?: boolean
  message?: string
  email?: string
  adminPassword?: string
}

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  adminPassword: z.string().min(1, 'Senha de administrador é obrigatória'),
})

export async function createAccount(prevState: CreateAccountResponse | null, formData: FormData): Promise<CreateAccountResponse> {
  const adminPassword = formData.get('adminPassword') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    // Validate input data
    const validatedData = createUserSchema.parse({
      email,
      password,
      adminPassword,
    })

    const envAdminPassword = env.ADMIN_PASSWORD
    if (!envAdminPassword) {
      console.error('Admin password is not set in environment variables.')
      return { error: 'Senha de administrador não configurada no sistema.', email, adminPassword }
    }

    // Check admin password
    if (validatedData.adminPassword !== envAdminPassword) {
      return { error: 'Senha de administrador incorreta.', email, adminPassword }
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1)

    if (existingUser.length > 0) {
      return { error: 'Um usuário com este email já existe.', email, adminPassword }
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds)

    // Create the user in the database
    await db.insert(users).values({
      email: validatedData.email,
      name: validatedData.email.split('@')[0], // Use email prefix as default name
      password: hashedPassword, // Store the hashed password
      role: 'user',
      isActive: true,
    })

    console.log('User created successfully:', { email: validatedData.email })

    revalidatePath('/admin/criar-conta')
    return {
      success: true,
      message: 'Conta criada com sucesso! O usuário pode agora fazer login.'
    }

  } catch (error) {
    console.error('Error creating account:', error)

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        error: firstError?.message ?? 'Dados inválidos fornecidos.',
        email,
        adminPassword
      }
    }

    return {
      error: 'Erro interno do servidor. Tente novamente mais tarde.',
      email,
      adminPassword
    }
  }
}