"use client"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <button 
      onClick={handleSignOut}
      className="p-3 text-red-400 hover:text-red-200 hover:bg-red-950/50 rounded-full transition-all" 
      title="Log Out"
    >
      <LogOut size={20} />
    </button>
  )
}