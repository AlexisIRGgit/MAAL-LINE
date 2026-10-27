import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

/**
 * TOTP two-factor auth (RFC 6238: SHA-1, 6 digits, 30s steps), compatible with
 * Google Authenticator, Authy and 1Password. Server-only: never import from Edge files.
 */

const ISSUER = 'MAAL LINE'
const STEP_SECONDS = 30
const DIGITS = 6
// Accept the previous and next step too, to tolerate phone clock drift
const DRIFT_STEPS = 1
const BACKUP_CODE_COUNT = 10
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

// ---------- Base32 ----------

function base32Encode(buffer: Buffer): string {
  let bits = 0
  let value = 0
  let output = ''
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return output
}

function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, '').replace(/\s/g, '').toUpperCase()
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index === -1) throw new Error('Invalid base32 secret')
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

// ---------- TOTP ----------

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20))
}

function hotp(secret: Buffer, counter: number): string {
  const message = Buffer.alloc(8)
  message.writeBigUInt64BE(BigInt(counter))
  const hmac = createHmac('sha1', secret).update(message).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS
  return code.toString().padStart(DIGITS, '0')
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/**
 * Returns the matched time step, or null. Callers store the step and pass it back as
 * `lastStep` so the same code can't be replayed inside its validity window.
 */
export function verifyTotp(secret: string, code: string, lastStep?: number | null): number | null {
  if (!/^\d{6}$/.test(code)) return null
  const key = base32Decode(secret)
  const current = Math.floor(Date.now() / 1000 / STEP_SECONDS)
  for (let step = current - DRIFT_STEPS; step <= current + DRIFT_STEPS; step++) {
    if (lastStep != null && step <= lastStep) continue
    if (safeEqual(hotp(key, step), code)) return step
  }
  return null
}

export function buildOtpauthUri(secret: string, accountEmail: string): string {
  const label = encodeURIComponent(`${ISSUER}:${accountEmail}`)
  const params = new URLSearchParams({
    secret,
    issuer: ISSUER,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}

/** "ABCD EFGH ..." so the secret is easy to type by hand */
export function formatSecretForDisplay(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim()
}

// ---------- Secret encryption at rest ----------

function encryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is required for two-factor auth')
  return createHash('sha256').update(`maal-2fa:${secret}`).digest()
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join(':')
}

export function decryptSecret(stored: string): string {
  const [version, iv, tag, data] = stored.split(':')
  if (version !== 'v1' || !iv || !tag || !data) throw new Error('Unknown 2FA secret format')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8')
}

// ---------- Backup codes ----------

function normalizeBackupCode(code: string): string {
  return code.replace(/[\s-]/g, '').toUpperCase()
}

function hashBackupCode(code: string): string {
  return createHash('sha256').update(normalizeBackupCode(code)).digest('hex')
}

/** Plain codes (shown once, "XXXXX-XXXXX") plus the hashes to store */
export function generateBackupCodes(): { codes: string[]; hashes: string[] } {
  const codes = Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const raw = base32Encode(randomBytes(7)).slice(0, 10)
    return `${raw.slice(0, 5)}-${raw.slice(5)}`
  })
  return { codes, hashes: codes.map(hashBackupCode) }
}

/** Returns the remaining hashes when the code matches (it is single use), or null */
export function consumeBackupCode(hashes: string[], code: string): string[] | null {
  if (normalizeBackupCode(code).length !== 10) return null
  const hash = hashBackupCode(code)
  const index = hashes.findIndex((stored) => safeEqual(stored, hash))
  if (index === -1) return null
  return hashes.filter((_, i) => i !== index)
}

// ---------- Login / sensitive-action check ----------

type TwoFactorFields = {
  twoFactorSecret: string | null
  twoFactorBackupCodes: string[]
  twoFactorLastStep: number | null
}

/**
 * Checks a 6-digit app code or a backup code. On success returns the user fields to
 * persist (the used step, or the backup list without the spent code).
 */
export function checkSecondFactor(
  user: TwoFactorFields,
  code: string
): { method: 'totp' | 'backup'; update: Partial<TwoFactorFields> } | null {
  const trimmed = code.trim()
  if (/^\d{6}$/.test(trimmed)) {
    if (!user.twoFactorSecret) return null
    const step = verifyTotp(decryptSecret(user.twoFactorSecret), trimmed, user.twoFactorLastStep)
    return step === null ? null : { method: 'totp', update: { twoFactorLastStep: step } }
  }
  const remaining = consumeBackupCode(user.twoFactorBackupCodes, trimmed)
  return remaining === null ? null : { method: 'backup', update: { twoFactorBackupCodes: remaining } }
}
