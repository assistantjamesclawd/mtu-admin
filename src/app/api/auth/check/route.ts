import { NextResponse } from 'next/server'
import { getAuthFromCookie } from '@/lib/auth'
import { getUserByEmail } from '@/data/authorized-users'

export async function GET() {
  const auth = await getAuthFromCookie()
  
  if (!auth) {
    return NextResponse.json({ authenticated: false })
  }

  const user = getUserByEmail(auth.email)
  
  return NextResponse.json({ 
    authenticated: true,
    email: auth.email,
    name: user?.name,
    role: user?.role,
  })
}
