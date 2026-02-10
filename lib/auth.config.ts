import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

// This is the base config that can be used in Edge Runtime (middleware)
// It doesn't include database operations

export const authConfig: NextAuthConfig = {
  trustHost: true, // Required for Vercel deployment
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
      const adminRoles = ['employee', 'manager', 'admin', 'owner']
      const isAdminUser = userRole && adminRoles.includes(userRole)

      // Routes that require authentication
      const protectedRoutes = ['/cuenta', '/checkout', '/orders']
      // Admin login page (special handling)
      const isAdminLoginPage = nextUrl.pathname === '/admin/login'
      // Admin routes (except login)
      const isAdminRoute = nextUrl.pathname.startsWith('/admin') && !isAdminLoginPage
      // Public guest routes
      const isPublicLoginPage = nextUrl.pathname === '/login'
      const isRegisterPage = nextUrl.pathname === '/register'

      const isProtectedRoute = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      )

      // Admin login page handling
      if (isAdminLoginPage) {
        // If logged in as admin, redirect to admin dashboard
        if (isLoggedIn && isAdminUser) {
          return Response.redirect(new URL('/admin', nextUrl))
        }
        // If logged in as customer, redirect to home
        if (isLoggedIn && !isAdminUser) {
          return Response.redirect(new URL('/', nextUrl))
        }
        // Allow access to admin login
        return true
      }

      // Public login page handling
      if (isPublicLoginPage) {
        // If logged in as admin, redirect to admin dashboard
        if (isLoggedIn && isAdminUser) {
          return Response.redirect(new URL('/admin', nextUrl))
        }
        // If logged in as customer, redirect to home
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl))
        }
        return true
      }

      // Register page - redirect logged-in users
      if (isRegisterPage && isLoggedIn) {
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
          return Response.redirect(new URL('/admin/login', nextUrl))
        }
        if (!isAdminUser) {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = token.role as any
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
