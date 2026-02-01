import { cookies } from 'next/headers'

const AUTH_COOKIE = 'mtu_admin_auth'
const TOKEN_SECRET = process.env.AUTH_SECRET || 'mtu-admin-secret-change-in-prod'

// Simple token: base64(email:timestamp:hash)
export function generateToken(email: string): string {
  const timestamp = Date.now()
  const data = `${email}:${timestamp}`
  const hash = simpleHash(data + TOKEN_SECRET)
  return Buffer.from(`${data}:${hash}`).toString('base64')
}

export function verifyToken(token: string): { email: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [email, timestampStr, hash] = decoded.split(':')
    const timestamp = parseInt(timestampStr)
    
    // Verify hash
    const expectedHash = simpleHash(`${email}:${timestamp}` + TOKEN_SECRET)
    if (hash !== expectedHash) return null
    
    // Check if token is expired (7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - timestamp > maxAge) return null
    
    return { email, timestamp }
  } catch {
    return null
  }
}

// Simple hash function
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// Magic link token (short-lived, 15 min)
export function generateMagicToken(email: string): string {
  const timestamp = Date.now()
  const data = `${email}:${timestamp}:magic`
  const hash = simpleHash(data + TOKEN_SECRET)
  return Buffer.from(`${data}:${hash}`).toString('base64url')
}

export function verifyMagicToken(token: string): { email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [email, timestampStr, type, hash] = decoded.split(':')
    
    if (type !== 'magic') return null
    
    const timestamp = parseInt(timestampStr)
    const expectedHash = simpleHash(`${email}:${timestamp}:magic` + TOKEN_SECRET)
    if (hash !== expectedHash) return null
    
    // Magic links expire in 15 minutes
    if (Date.now() - timestamp > 15 * 60 * 1000) return null
    
    return { email }
  } catch {
    return null
  }
}

export async function setAuthCookie(email: string) {
  const token = generateToken(email)
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

export async function getAuthFromCookie(): Promise<{ email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
}
