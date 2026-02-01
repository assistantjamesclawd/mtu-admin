'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [codeToken, setCodeToken] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'invalid_token') {
      setError('Login link expired or invalid. Please request a new code.')
    } else if (errorParam === 'unauthorized') {
      setError('This email is not authorized to access the admin dashboard.')
    }
  }, [searchParams])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.success && data.codeToken) {
        setCodeToken(data.codeToken)
        setStep('code')
        // Focus first code input
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to send login code')
    }

    setSending(false)
  }

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        verifyCode(fullCode)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      verifyCode(pasted)
    }
  }

  const verifyCode = async (fullCode: string) => {
    setVerifying(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode, codeToken }),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/')
      } else {
        setError(data.error || 'Invalid code')
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError('Failed to verify code')
    }

    setVerifying(false)
  }

  if (step === 'code') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter your code</h1>
          <p className="text-gray-600 mb-6">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={verifying}
                className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-[#b5c4b1] focus:border-[#3d3530] disabled:opacity-50"
              />
            ))}
          </div>

          {verifying && (
            <p className="text-gray-500 mb-4">Verifying...</p>
          )}

          <p className="text-sm text-gray-500 mb-4">
            Code expires in 15 minutes
          </p>

          <button
            onClick={() => {
              setStep('email')
              setCode(['', '', '', '', '', ''])
              setCodeToken(null)
              setError(null)
            }}
            className="text-[#3d3530] font-medium hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3d3530]">Mountain Time</h1>
          <p className="text-gray-500">Admin Dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mountaintimeutah.com"
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-[#3d3530] text-white py-3 rounded-lg font-medium hover:bg-[#3d3530]/90 transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send login code'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Only authorized team members can access this dashboard.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
