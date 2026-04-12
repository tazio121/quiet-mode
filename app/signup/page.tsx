'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      setMessage(error.message)
      setMessageType('error')
    } else {
      setMessage('Check your email for confirmation')
      setMessageType('success')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (messageType === 'success') {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [messageType, router])

  if (messageType === 'success') {
    return (
      <div className="min-h-screen quiet-app-shell px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-md rounded-[32px] quiet-panel p-8 shadow-[0_32px_120px_-80px_rgba(15,23,42,0.8)] backdrop-blur sm:p-10">
          <div className="space-y-3">
            <Logo size="sm" className="mb-5" />
            <h1 className="text-3xl font-semibold quiet-text-primary">Check your email</h1>
            <p className="text-sm leading-6 quiet-text-secondary">
              {message}
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-full quiet-primary-cta px-4 py-3 text-sm font-semibold transition"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen quiet-app-shell px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-md rounded-[32px] quiet-panel p-8 shadow-[0_32px_120px_-80px_rgba(15,23,42,0.8)] backdrop-blur sm:p-10">
        <div className="space-y-3">
          <Logo size="sm" className="mb-5" />
          <h1 className="text-3xl font-semibold quiet-text-primary">Create your account</h1>
          <p className="text-sm leading-6 quiet-text-secondary">
            Join Quiet Mode and begin building a calmer routine for sleep, focus, and recovery.
          </p>
        </div>

        {message && messageType === 'error' && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{message}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm quiet-text-secondary">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="quiet-input mt-2"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm quiet-text-secondary">Password</span>
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="quiet-input mt-2"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full quiet-primary-cta px-4 py-3 text-sm font-semibold transition hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm quiet-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium quiet-text-primary hover:text-white">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
