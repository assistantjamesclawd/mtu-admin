import { NextRequest, NextResponse } from 'next/server'
import { verifyCodeToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { code, codeToken } = await request.json()
    
    if (!code || !codeToken) {
      return NextResponse.json({ error: 'Code and token required' }, { status: 400 })
    }

    const result = verifyCodeToken(codeToken, code)
    
    if (!result) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    // Set auth cookie
    await setAuthCookie(result.email)
    
    return NextResponse.json({ 
      success: true,
      email: result.email
    })

  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
