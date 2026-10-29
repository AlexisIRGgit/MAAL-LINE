import { prisma } from '@/lib/db'

/**
 * In-app notifications for the admin bell (one row per staff member in the `notifications` table).
 * Unlike the ntfy/email alerts they are always on, so the panel keeps a full history.
 */

// 'viewer' is left out on purpose: the production UserRole enum doesn't have it
const STAFF_ROLES = ['employee', 'manager', 'admin', 'owner'] as const

export type AdminNotificationType = 'new_order' | 'low_stock' | 'new_account' | 'drop_waitlist'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function notifyStaff(input: {
  type: AdminNotificationType
  title: string
  message: string
  actionUrl?: string
  referenceType?: string
  referenceId?: string | null
}): Promise<void> {
  const staff = await prisma.user.findMany({
    where: { role: { in: [...STAFF_ROLES] }, status: 'active', deletedAt: null },
    select: { id: true },
  })
  if (staff.length === 0) return
  await prisma.notification.createMany({
    data: staff.map((user) => ({
      userId: user.id,
      type: input.type,
      title: input.title.slice(0, 255),
      message: input.message,
      actionUrl: input.actionUrl ?? null,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId && UUID_RE.test(input.referenceId) ? input.referenceId : null,
    })),
  })
}
