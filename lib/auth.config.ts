import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

// This is the base config that can be used in Edge Runtime (middleware)
// It doesn't include database operations

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    // Credentials provider with minimal config for Edge
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // authorize will be overridden in full auth.ts
      authorize: async () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const userRole = auth?.user?.role as string | undefined

      // Routes that require authentication
      const protectedRoutes = ['/account', '/checkout', '/orders']
      // Routes only for admins/employees
      const adminRoutes = ['/admin']
      // Routes only for guests
      const guestRoutes = ['/login', '/register']

      const isProtectedRoute = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      )
      const isAdminRoute = adminRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      )
      const isGuestRoute = guestRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      )

      // Redirect logged-in users away from guest routes
      if (isGuestRoute && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl))
      }

      // Redirect non-logged-in users to login
      if (isProtectedRoute && !isLoggedIn) {
        const callbackUrl = encodeURIComponent(nextUrl.pathname)
        return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
      }

      // Check admin access
      if (isAdminRoute) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/login', nextUrl))
        }
        const allowedRoles = ['employee', 'manager', 'admin', 'owner']
        if (!userRole || !allowedRoles.includes(userRole)) {
          return Response.redirect(new URL('/', nextUrl))
        }
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}
