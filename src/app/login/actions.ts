'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import { translateAuthError } from '@/utils/error-translations'

export interface LoginResponse {
  error?: string
  email?: string
}

export async function login(prevState: LoginResponse | null, formData: FormData): Promise<LoginResponse> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    revalidatePath('/', 'layout')
    redirect(redirectTo || '/')
  } catch (error) {
    if (error instanceof AuthError) {
      console.error('Error logging in:', error)
      return { error: translateAuthError(error.message), email }
    }
    throw error
  }
}

export async function signup(formData: FormData) {
  // TODO: Implement signup with Auth.js
  // You'll need to create a user in the database and then sign them in
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  console.log('Signup attempt:', { email: data.email })

  // Placeholder - replace with actual user creation logic
  redirect('/error')
}

export async function signout() {
  await signOut({ redirect: false })
  revalidatePath('/', 'layout')
  redirect('/login')
}