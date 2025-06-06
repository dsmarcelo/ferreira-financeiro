import { createClient } from './server'

/**
 * Get the current authenticated user from server context
 * This should only be used in server components/actions where you're sure
 * the user is authenticated (after middleware has validated authentication)
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  return user
}

/**
 * Get the current user ID from server context
 * Convenience function for when you only need the user ID
 */
export async function getCurrentUserId() {
  const user = await getCurrentUser()
  return user.id
}
