import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import type { UserRole } from '@prisma/client'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Dynamic imports to avoid Edge Runtime issues
        const bcrypt = await import('bcryptjs')
        const { prisma } = await import('./db')

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

        if (!isPasswordValid) {
          // Log failed login attempt
          await prisma.securityEvent.create({
            data: {
              userId: user.id,
              email: user.email,
              eventType: 'login_failed',
              severity: 'warning',
            },
          })
          return null
        }

        // Check if user is active
        if (user.status !== 'active') {
          return null
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        // Log successful login
        await prisma.securityEvent.create({
          data: {
            userId: user.id,
            email: user.email,
            eventType: 'login_success',
            severity: 'info',
          },
        })

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Handle OAuth sign in
      if (account?.provider === 'google') {
        const { prisma } = await import('./db')

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (existingUser) {
          // Update OAuth info if user exists
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              authProvider: 'google',
              authProviderId: account.providerAccountId,
              emailVerified: true,
              emailVerifiedAt: new Date(),
              lastLoginAt: new Date(),
            },
          })
        } else {
          // Create new user for OAuth
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              firstName: user.name?.split(' ')[0] || null,
              lastName: user.name?.split(' ').slice(1).join(' ') || null,
              avatarUrl: user.image,
              authProvider: 'google',
              authProviderId: account.providerAccountId,
              emailVerified: true,
              emailVerifiedAt: new Date(),
              role: 'customer',
              status: 'active',
            },
          })

          // Create customer profile
          await prisma.customerProfile.create({
            data: {
              userId: newUser.id,
            },
          })
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as UserRole
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
})
