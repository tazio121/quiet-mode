'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center justify-center rounded-full quiet-secondary-btn px-5 py-3 text-sm font-semibold transition"
    >
      Log out
    </button>
  )
}
