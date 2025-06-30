import { auth } from '@/auth'

/**
 * Get the current authenticated user from server context
 * This should only be used in server components/actions where you're sure
 * the user is authenticated (after middleware has validated authentication)
 */
export async function getCurrentUser() {
  const session = await auth()

  if (!session?.user) {
    throw new Error('User not authenticated')
  }

  return session.user
}

/**
 * Get the current user ID from server context
 * Convenience function for when you only need the user ID
 */
export async function getCurrentUserId() {
  const user = await getCurrentUser()
  return user.id!
}

/**
 * Get the current session from server context
 * Returns null if no session exists
 */
export async function getCurrentSession() {
  return await auth()
}

/**
 * Check if the current user is authenticated
 * Returns true if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const session = await auth()
  return !!session?.user
}