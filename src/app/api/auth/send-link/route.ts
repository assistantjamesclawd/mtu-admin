import { NextRequest, NextResponse } from 'next/server'
import { generateMagicToken } from '@/lib/auth'
import { isAuthorizedEmail, getUserByEmail } from '@/data/authorized-users'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if authorized
    if (!isAuthorizedEmail(normalizedEmail)) {
      // Don't reveal if email exists or not
      return NextResponse.json({ 
        success: true, 
        message: 'If this email is authorized, a login link has been sent.' 
      })
    }

    const user = getUserByEmail(normalizedEmail)
    const token = generateMagicToken(normalizedEmail)
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mtu-admin.vercel.app'}/api/auth/verify?token=${token}`

    // For now, log the link (in production, send via email)
    console.log(`\n🔐 Login link for ${user?.name} (${normalizedEmail}):\n${loginUrl}\n`)

    // TODO: Send email with login link
    // For now, we'll return the link in dev mode
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        message: 'Check console for login link',
        // Remove this in production:
        devLink: loginUrl 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If this email is authorized, a login link has been sent.' 
    })

  } catch (error) {
    console.error('Send link error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
