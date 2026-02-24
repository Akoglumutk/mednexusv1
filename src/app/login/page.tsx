"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })

    if (error) {
      alert("Erişim Reddedildi: " + error.message)
      setIsLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-300 selection:bg-amber-900/50">
      <div className="bg-zinc-900/50 p-8 rounded-xl border border-amber-900/30 w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Aesthetic Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-600/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="text-center relative z-10">
          <h1 className="text-amber-500 text-4xl font-serif mb-2 tracking-tight">
            Med<span className="text-red-700">Nexus</span>
          </h1>
          <p className="text-zinc-500 text-[10px] mb-8 uppercase tracking-[0.3em] font-mono flex items-center justify-center gap-2">
            <ShieldAlert size={12} className="text-amber-600" />
            Personal Operating System
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="text-[10px] text-amber-600/80 mb-1.5 block uppercase tracking-widest font-bold">Terminal ID</label>
            <input 
              type="email" 
              placeholder="E-posta"
              required
              className="w-full p-3 bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all [color-scheme:dark]"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] text-amber-600/80 mb-1.5 block uppercase tracking-widest font-bold">Passcode</label>
            <input 
              type="password" 
              placeholder="••••••••"
              required
              className="w-full p-3 bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all [color-scheme:dark]"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={isLoading}
            className="w-full bg-amber-600/20 text-amber-500 border border-amber-600/50 font-bold font-mono text-xs uppercase tracking-widest py-3.5 rounded-lg hover:bg-amber-600/30 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? "Authenticating..." : "Initialize Session"}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center relative z-10">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-mono">
            Restricted Access • Encrypted Protocol
          </p>
        </div>
      </div>
    </div>
  )
}