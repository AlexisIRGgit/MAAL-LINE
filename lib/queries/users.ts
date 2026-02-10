import { prisma } from '@/lib/db'
import { UserRole, UserStatus } from '@prisma/client'

// Get all team members (non-customers)
export async function getTeamMembers() {
  return prisma.user.findMany({
    where: {
      role: {
        not: 'customer',
      },
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
      employeeDetails: {
        select: {
          department: true,
          position: true,
        },
      },
    },
    orderBy: [
      { role: 'desc' },
      { createdAt: 'desc' },
    ],
  })
}

// Get user by ID
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
      employeeDetails: {
        select: {
          id: true,
          department: true,
          position: true,
          employeeCode: true,
          hireDate: true,
          notes: true,
        },
      },
    },
  })
}

// Create team member
export async function createTeamMember(data: {
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  password: string
  department?: string
  position?: string
}) {
  const bcrypt = await import('bcryptjs')
  const passwordHash = await bcrypt.hash(data.password, 12)

  return prisma.user.create({
    data: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
      passwordHash,
      status: 'active',
      emailVerified: true,
      employeeDetails: (data.department || data.position) ? {
        create: {
          department: data.department,
          position: data.position,
        },
      } : undefined,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  })
}

// Update team member
export async function updateTeamMember(id: string, data: {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  role?: UserRole
  status?: UserStatus
  password?: string
  department?: string
  position?: string
}) {
  const updateData: Record<string, unknown> = {}

  if (data.email) updateData.email = data.email
  if (data.firstName) updateData.firstName = data.firstName
  if (data.lastName) updateData.lastName = data.lastName
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.role) updateData.role = data.role
  if (data.status) updateData.status = data.status

  if (data.password) {
    const bcrypt = await import('bcryptjs')
    updateData.passwordHash = await bcrypt.hash(data.password, 12)
  }

  // Update user
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
    },
  })

  // Update or create employee details
  if (data.department !== undefined || data.position !== undefined) {
    await prisma.employeeDetails.upsert({
      where: { userId: id },
      create: {
        userId: id,
        department: data.department,
        position: data.position,
      },
      update: {
        department: data.department,
        position: data.position,
      },
    })
  }

  return user
}

// Soft delete team member
export async function deleteTeamMember(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      status: 'inactive',
    },
  })
}

// Check if email exists
export async function emailExists(email: string, excludeId?: string) {
  const user = await prisma.user.findFirst({
    where: {
      email,
      id: excludeId ? { not: excludeId } : undefined,
    },
    select: { id: true },
  })
  return !!user
}

// Get team member count by role
export async function getTeamMemberCountByRole() {
  const counts = await prisma.user.groupBy({
    by: ['role'],
    where: {
      role: { not: 'customer' },
      deletedAt: null,
    },
    _count: true,
  })

  return counts.reduce((acc, item) => {
    acc[item.role] = item._count
    return acc
  }, {} as Record<string, number>)
}
