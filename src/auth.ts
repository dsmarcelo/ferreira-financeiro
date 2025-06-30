import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/server/db"
import { users } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (!parsedCredentials.success) return null

        const { email, password } = parsedCredentials.data

        try {
          // Look up the user in the database
          const userResult = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

          const foundUser = userResult[0]
          if (!foundUser) {
            console.log('User not found:', email)
            return null
          }

          // Check if user is active
          if (!foundUser.isActive) {
            console.log('User is inactive:', email)
            return null
          }

          // Verify password
          if (!foundUser.password) {
            console.log('User has no password set:', email)
            return null
          }

          const passwordMatch = await bcrypt.compare(password, foundUser.password)

          if (!passwordMatch) {
            console.log('Invalid password for user:', email)
            return null
          }

          // Return user object (excluding password and role for now)
          return {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
          }
        } catch (error) {
          console.error('Error during authentication:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})