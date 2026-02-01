import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicToken, setAuthCookie } from '@/lib/auth'
import { isAuthorizedEmail } from '@/data/authorized-users'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', request.url))
  }

  const result = verifyMagicToken(token)
  
  if (!result) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
  }

  if (!isAuthorizedEmail(result.email)) {
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
  }

  // Set auth cookie and redirect to dashboard
  await setAuthCookie(result.email)
  
  return NextResponse.redirect(new URL('/', request.url))
}
