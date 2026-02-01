import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateMagicToken } from '@/lib/auth'
import { isAuthorizedEmail, getUserByEmail } from '@/data/authorized-users'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  
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

    // Send email with magic link
    await resend.emails.send({
      from: 'Mountain Time Utah <noreply@mountaintimeutah.com>',
      to: normalizedEmail,
      subject: 'Your login link for MTU Admin',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a3728;">Hey ${user?.name || 'there'}!</h2>
          <p>Click the button below to access the Mountain Time Utah Admin Dashboard:</p>
          <a href="${loginUrl}" style="display: inline-block; background: #4a3728; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Sign In to Admin
          </a>
          <p style="color: #666; font-size: 14px;">This link expires in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this link, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">Mountain Time Utah • Heber City, Utah</p>
        </div>
      `,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Login link sent! Check your email.' 
    })

  } catch (error) {
    console.error('Send link error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
