"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Terminal, Smartphone, Tablet, Monitor, CalendarClock, ChevronRight, Plus, Loader2, Settings } from 'lucide-react'
import { getCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function AcademicBar({ term, settingsId, nextExamDate, nextExamName }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [val, setVal] = useState(term)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const deviceMode = getCookie('mednexus_device_mode') || 'desktop'

  // Calculate days remaining
  const daysLeft = nextExamDate ? Math.ceil((new Date(nextExamDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

  const save = async () => {
    if (val === term) return setIsEditing(false)
    setLoading(true)
    await supabase.from('settings').update({ current_term: val }).eq('id', settingsId)
    setIsEditing(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
      
      {/* LEFT: THE ACADEMIC STATUS */}
      <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 pl-3 pr-6 py-2 rounded-full shadow-xl transition-all hover:border-amber-500/30 group">
        
        {/* Icon Box */}
        <div className="p-2 bg-gradient-to-br from-amber-900/40 to-black rounded-full border border-amber-500/20 group-hover:border-amber-500/50 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin text-amber-500" /> : <Terminal size={14} className="text-amber-500" />}
        </div>

        {/* Term Input */}
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Current Protocol</span>
          {isEditing ? (
            <input 
              autoFocus 
              onBlur={save} 
              onKeyDown={(e) => e.key === 'Enter' && save()}
              value={val} 
              onChange={(e) => setVal(e.target.value)} 
              className="bg-transparent text-zinc-100 font-bold text-sm outline-none w-32 [color-scheme:dark]" 
            />
          ) : (
            <span 
              onClick={() => setIsEditing(true)} 
              className="text-sm font-bold text-zinc-200 cursor-pointer hover:text-amber-400 transition-colors truncate"
            >
              {val || 'Select Term...'}
            </span>
          )}
        </div>
      </div>

      {/* CENTER: THE EXAM TICKER (Visible if exam exists) */}
      {daysLeft !== null && (
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-red-950/20 border border-red-900/30 rounded-full animate-pulse-slow">
          <CalendarClock size={14} className="text-red-500" />
          <span className="text-xs font-mono text-red-200">
            <span className="font-bold">{nextExamName}</span> in {daysLeft} days
          </span>
        </div>
      )}

      {/* RIGHT: SYSTEM HUD */}
      <div className="flex items-center gap-3">
        
        {/* Device Indicator */}
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-full shadow-inner ${
             deviceMode === 'mobile' ? 'border-red-900/30' : 
             deviceMode === 'tablet' ? 'border-amber-900/30' : 'border-blue-900/30'
        }`}>
          <span className="text-[9px] font-mono uppercase text-zinc-600 tracking-wider">System:</span>
          <div className={`flex items-center gap-1.5 text-xs font-bold ${
            deviceMode === 'mobile' ? 'text-red-500' : 
            deviceMode === 'tablet' ? 'text-amber-500' : 'text-blue-500'
          }`}>
            {deviceMode === 'mobile' && <><Smartphone size={14} /> SCOUT</>}
            {deviceMode === 'tablet' && <><Tablet size={14} /> ARTIST</>}
            {deviceMode === 'desktop' && <><Monitor size={14} /> ARCHITECT</>}
          </div>
        </div>

        {/* Quick Action */}
        <Link href='/device-select' className="group block outline-none">
          <button className="p-2 bg-zinc-100 text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <Settings size={18} />
          </button>
        </Link>

      </div>
    </div>
  )
}