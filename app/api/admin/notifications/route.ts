import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const SELECT = { id: true, type: true, title: true, message: true, actionUrl: true, readAt: true, createdAt: true } as const

/** The signed-in staff member's notifications, newest first, plus the unread count. Polled by the admin bell. */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const userId = session.user.id
    const params = request.nextUrl.searchParams
    const limit = Math.min(Math.max(Number(params.get('limit')) || 15, 1), 100)
    const unreadOnly = params.get('unread') === '1'
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId, ...(unreadOnly && { readAt: null }) },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: SELECT,
      }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ])
    return NextResponse.json({ items, unread }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return handleAuthError(error)
  }
}

/** Marks notifications as read: `{ ids: [...] }` or `{ all: true }` */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = (await request.json().catch(() => null)) as { ids?: unknown; all?: unknown } | null
    const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is string => typeof id === 'string').slice(0, 100) : []
    if (!body?.all && ids.length === 0) return NextResponse.json({ error: 'Nada que marcar' }, { status: 400 })
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null, ...(body?.all ? {} : { id: { in: ids } }) },
      data: { readAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
