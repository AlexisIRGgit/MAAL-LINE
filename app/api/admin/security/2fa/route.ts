import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import {
  buildOtpauthUri,
  checkSecondFactor,
  decryptSecret,
  encryptSecret,
  formatSecretForDisplay,
  generateBackupCodes,
  generateTotpSecret,
  verifyTotp,
} from '@/lib/two-factor'

const twoFactorSelect = {
  id: true,
  email: true,
  passwordHash: true,
  twoFactorEnabled: true,
  twoFactorSecret: true,
  twoFactorBackupCodes: true,
  twoFactorLastStep: true,
} as const

async function getStaffUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: twoFactorSelect })
  if (!user) throw new Error('User not found')
  return user
}

// GET - Current 2FA status of the signed-in staff member
export async function GET() {
  try {
    const session = await requireAdmin()
    const user = await getStaffUser(session.user.id)
    return NextResponse.json({
      enabled: user.twoFactorEnabled,
      backupCodesRemaining: user.twoFactorEnabled ? user.twoFactorBackupCodes.length : 0,
      hasPassword: !!user.passwordHash,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// POST - { action: 'setup' | 'enable' | 'disable' | 'regenerate', code?, password? }
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const user = await getStaffUser(session.user.id)

    const body = await request.json().catch(() => ({}))
    const action = typeof body.action === 'string' ? body.action : ''
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    switch (action) {
      // Start setup: a fresh pending secret, not active until a code confirms it
      case 'setup': {
        if (user.twoFactorEnabled) {
          return NextResponse.json({ error: 'La verificación en dos pasos ya está activa' }, { status: 400 })
        }
        if (!user.passwordHash) {
          return NextResponse.json(
            { error: 'Tu cuenta necesita una contraseña para activar la verificación en dos pasos' },
            { status: 400 }
          )
        }
        const secret = generateTotpSecret()
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorSecret: encryptSecret(secret), twoFactorLastStep: null },
        })
        const otpauthUri = buildOtpauthUri(secret, user.email)
        const qrSvg = await QRCode.toString(otpauthUri, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
        return NextResponse.json({ qrSvg, secret: formatSecretForDisplay(secret), otpauthUri })
      }

      // Confirm setup with the first code from the app; returns the backup codes once
      case 'enable': {
        if (user.twoFactorEnabled) {
          return NextResponse.json({ error: 'La verificación en dos pasos ya está activa' }, { status: 400 })
        }
        if (!user.twoFactorSecret) {
          return NextResponse.json({ error: 'Primero inicia la configuración' }, { status: 400 })
        }
        const step = verifyTotp(decryptSecret(user.twoFactorSecret), code)
        if (step === null) {
          return NextResponse.json({ error: 'Código incorrecto, intenta con el siguiente' }, { status: 400 })
        }
        const { codes, hashes } = generateBackupCodes()
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorEnabled: true, twoFactorLastStep: step, twoFactorBackupCodes: hashes },
        })
        await prisma.securityEvent.create({
          data: { userId: user.id, email: user.email, eventType: 'two_fa_enabled', severity: 'info' },
        })
        return NextResponse.json({ enabled: true, backupCodes: codes })
      }

      // New backup codes (invalidates the old ones); needs a current code
      case 'regenerate': {
        if (!user.twoFactorEnabled) {
          return NextResponse.json({ error: 'La verificación en dos pasos no está activa' }, { status: 400 })
        }
        const check = checkSecondFactor(user, code)
        if (!check) {
          return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 })
        }
        const { codes, hashes } = generateBackupCodes()
        await prisma.user.update({
          where: { id: user.id },
          data: { ...check.update, twoFactorBackupCodes: hashes },
        })
        return NextResponse.json({ backupCodes: codes })
      }

      // Turn off: needs both the password and a current (or backup) code
      case 'disable': {
        if (!user.twoFactorEnabled) {
          return NextResponse.json({ error: 'La verificación en dos pasos no está activa' }, { status: 400 })
        }
        const passwordOk = !!user.passwordHash && !!password && (await bcrypt.compare(password, user.passwordHash))
        if (!passwordOk) {
          return NextResponse.json({ error: 'La contraseña es incorrecta' }, { status: 400 })
        }
        if (!checkSecondFactor(user, code)) {
          return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 })
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [], twoFactorLastStep: null },
        })
        await prisma.securityEvent.create({
          data: { userId: user.id, email: user.email, eventType: 'two_fa_disabled', severity: 'warning' },
        })
        return NextResponse.json({ enabled: false })
      }

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }
  } catch (error) {
    return handleAuthError(error)
  }
}
