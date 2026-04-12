'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen quiet-app-shell px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-md rounded-[32px] quiet-panel p-8 shadow-[0_32px_120px_-80px_rgba(15,23,42,0.8)] backdrop-blur sm:p-10">
        <div className="space-y-3">
          <Logo size="sm" className="mb-5" />
          <h1 className="text-3xl font-semibold quiet-text-primary">Log in to your account</h1>
          <p className="text-sm leading-6 quiet-text-secondary">
            Sign in and step into a calm space for bedtime and morning routines.
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{message}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
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
              placeholder="Enter password"
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm quiet-text-secondary">
          New to Quiet Mode?{' '}
          <Link href="/signup" className="font-medium quiet-text-primary hover:text-white">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}