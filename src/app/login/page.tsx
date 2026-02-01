'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for error params
    const errorParam = searchParams.get('error')
    if (errorParam === 'invalid_token') {
      setError('Login link expired or invalid. Please request a new one.')
    } else if (errorParam === 'unauthorized') {
      setError('This email is not authorized to access the admin dashboard.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (data.success) {
        setSent(true)
        // In dev, show the link
        if (data.devLink) {
          console.log('Dev login link:', data.devLink)
        }
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to send login link')
    }

    setSending(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600 mb-6">
            We sent a login link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            The link expires in 15 minutes.
          </p>
          <button
            onClick={() => {
              setSent(false)
              setEmail('')
            }}
            className="mt-6 text-[#3d3530] font-medium hover:underline"
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
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3d3530]">Mountain Time</h1>
          <p className="text-gray-500">Admin Dashboard</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            {sending ? 'Sending...' : 'Send login link'}
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
