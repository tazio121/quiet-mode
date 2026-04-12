'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050508] px-6 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_32px_120px_-80px_rgba(15,23,42,0.8)] backdrop-blur sm:p-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quiet Mode</p>
          <h1 className="text-3xl font-semibold text-white">Log in to your account</h1>
          <p className="text-sm leading-6 text-slate-400">
            Sign in and step into a calm space for bedtime and morning routines.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-800/90 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-800/90 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          New to Quiet Mode?{' '}
          <Link href="/signup" className="font-medium text-white hover:text-slate-100">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}