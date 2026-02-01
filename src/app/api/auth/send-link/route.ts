import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateLoginCode, generateCodeToken } from '@/lib/auth'
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
        message: 'If this email is authorized, a code has been sent.',
        codeToken: 'invalid' // Fake token so UI proceeds but verify will fail
      })
    }

    const user = getUserByEmail(normalizedEmail)
    const code = generateLoginCode()
    const codeToken = generateCodeToken(normalizedEmail, code)

    // Send email with login code
    await resend.emails.send({
      from: 'Mountain Time Utah <noreply@mountaintimeutah.com>',
      to: normalizedEmail,
      subject: `${code} is your MTU Admin login code`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a3728;">Hey ${user?.name || 'there'}!</h2>
          <p>Enter this code to access the Mountain Time Utah Admin Dashboard:</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4a3728;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">Mountain Time Utah • Heber City, Utah</p>
        </div>
      `,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Code sent! Check your email.',
      codeToken // Client stores this to verify code later
    })

  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
