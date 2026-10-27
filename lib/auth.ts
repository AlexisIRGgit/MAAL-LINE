import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import type { UserRole } from '@prisma/client'
import { authConfig } from './auth.config'

// Error codes reach the client as `result.code` from signIn('credentials', { redirect: false })
class TwoFactorRequired extends CredentialsSignin {
  code = 'two_factor_required'
}
class TwoFactorInvalid extends CredentialsSignin {
  code = 'two_factor_invalid'
}
class TwoFactorLocked extends CredentialsSignin {
  code = 'two_factor_locked'
}

const TWO_FACTOR_MAX_FAILURES = 5
const TWO_FACTOR_LOCK_MINUTES = 15

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
        otp: { label: 'Code', type: 'text' },
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

        // Second factor: only checked after the password, so it never leaks which accounts use 2FA
        let twoFactorUpdate = {}
        if (user.twoFactorEnabled) {
          const otp = typeof credentials.otp === 'string' ? credentials.otp : ''
          if (!otp) throw new TwoFactorRequired()

          const recentFailures = await prisma.securityEvent.count({
            where: {
              userId: user.id,
              eventType: 'login_failed',
              metadata: { path: ['reason'], equals: 'invalid_2fa' },
              createdAt: { gte: new Date(Date.now() - TWO_FACTOR_LOCK_MINUTES * 60_000) },
            },
          })
          if (recentFailures >= TWO_FACTOR_MAX_FAILURES) throw new TwoFactorLocked()

          const { checkSecondFactor } = await import('./two-factor')
          const result = checkSecondFactor(user, otp)
          if (!result) {
            await prisma.securityEvent.create({
              data: {
                userId: user.id,
                email: user.email,
                eventType: 'login_failed',
                severity: 'warning',
                metadata: { reason: 'invalid_2fa' },
              },
            })
            throw new TwoFactorInvalid()
          }
          twoFactorUpdate = result.update
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date(), ...twoFactorUpdate },
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
          // Google sign-in would skip the authenticator code, so 2FA accounts must use the password flow
          if (existingUser.twoFactorEnabled) {
            return '/admin/login?error=two_factor_google'
          }

          // Update OAuth info and fill missing profile data
          const firstName = user.name?.split(' ')[0] || null
          const lastName = user.name?.split(' ').slice(1).join(' ') || null

          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              authProvider: 'google',
              authProviderId: account.providerAccountId,
              emailVerified: true,
              emailVerifiedAt: new Date(),
              lastLoginAt: new Date(),
              // Update name and avatar if not already set
              ...((!existingUser.firstName && firstName) && { firstName }),
              ...((!existingUser.lastName && lastName) && { lastName }),
              ...((!existingUser.avatarUrl && user.image) && { avatarUrl: user.image }),
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
    async jwt({ token, user, trigger, account }) {
      // For OAuth logins (like Google), fetch user data from DB by email
      // because user.id is the OAuth provider ID, not our database ID
      if (user && account?.provider === 'google') {
        const { prisma } = await import('./db')
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
          token.email = user.email as string
          token.avatarUrl = dbUser.avatarUrl || (user.image as string | null)
        }
      } else if (user) {
        // For credentials login, user object already has our DB data
        token.id = user.id as string
        token.role = user.role as UserRole
        token.firstName = user.firstName as string | null
        token.lastName = user.lastName as string | null
        token.email = user.email as string
        token.avatarUrl = user.avatarUrl as string | null
      }

      // Refresh user data from DB if firstName is missing (for existing sessions)
      if (token.id && token.firstName === undefined) {
        const { prisma } = await import('./db')
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { firstName: true, lastName: true, avatarUrl: true, role: true },
        })
        if (dbUser) {
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
          token.avatarUrl = dbUser.avatarUrl
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.firstName = token.firstName as string | null
        session.user.lastName = token.lastName as string | null
        session.user.email = token.email as string
        session.user.avatarUrl = token.avatarUrl as string | null
      }
      return session
    },
  },
})
