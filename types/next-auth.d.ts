import { UserRole } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    role: UserRole
    avatarUrl: string | null
  }

  interface Session {
    user: User & {
      id: string
      role: UserRole
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
