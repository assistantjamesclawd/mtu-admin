import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple token verification for middleware (can't use cookies() directly)
function verifyTokenSimple(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const parts = decoded.split(':')
    if (parts.length < 3) return false
    
    const timestamp = parseInt(parts[1])
    // Check if token is expired (7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - timestamp > maxAge) return false
    
    return true
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't need auth
  const publicPaths = [
    '/login',
    '/api/auth/send-link',
    '/api/auth/verify',
    '/api/auth/check',
    '/api/auth/logout',
  ]

  // Check if current path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Also allow static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname === '/manifest.json') {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('mtu_admin_auth')?.value

  if (!authCookie || !verifyTokenSimple(authCookie)) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
