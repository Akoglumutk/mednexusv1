"use client"
import { useState, useEffect } from 'react'
import { Edit3, Save, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function CountdownCard({ initialData }: { initialData: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [committee, setCommittee] = useState(initialData?.current_committee || '')
  const [date, setDate] = useState(initialData?.exam_date || '')
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })

  const supabase = createClient()

  useEffect(() => {
    if (isEditing || !date) return;
    
    const targetDate = new Date(date).getTime()
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const diff = targetDate - now
      
      if (diff > 0) {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        })
      } else {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [date, isEditing])

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return;

      // Ensure we update the correct record
      await supabase.from('settings').upsert({ 
        id: initialData?.id || 1, // Fallback if no ID exists yet
        current_committee: committee, 
        exam_date: date,
        user_id: user.id 
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save countdown", error)
    }
  }

  // Format date for the datetime-local input reliably
  const formatForInput = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    // Needs YYYY-MM-DDThh:mm format
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  return (
    <div className="bg-zinc-900/50 border border-amber-900/40 p-5 md:p-6 rounded-xl relative shadow-lg h-full flex flex-col justify-between">
      {/* MOBIL UYUMLU: Buton her zaman görünür */}
      <button 
        onClick={() => setIsEditing(!isEditing)} 
        className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-amber-500 hover:bg-zinc-800 rounded-lg transition-all active:scale-90"
      >
        {isEditing ? <X size={18} /> : <Edit3 size={18} />}
      </button>

      {isEditing ? (
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-amber-500/80 uppercase tracking-widest font-bold block mb-1">Kurul Adı</label>
            <input 
              value={committee} 
              onChange={(e) => setCommittee(e.target.value)} 
              placeholder="Örn: Dönem 1 - Kurul 2"
              className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-100 text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" 
            />
          </div>
          <div>
            <label className="text-xs text-amber-500/80 uppercase tracking-widest font-bold block mb-1">Sınav Tarihi</label>
            <input 
              type="datetime-local" 
              value={formatForInput(date)} 
              onChange={(e) => setDate(new Date(e.target.value).toISOString())} 
              className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-zinc-100 text-sm outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all [color-scheme:dark]" 
            />
          </div>
          <button 
            onClick={handleSave} 
            className="w-full flex justify-center items-center gap-2 bg-amber-600/20 text-amber-500 border border-amber-600/50 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-600/30 active:scale-95 transition-all"
          >
            <Save size={16} /> Güncelle
          </button>
        </div>
      ) : (
        <>
          <div className="pt-2">
            <h2 className="text-xs uppercase tracking-[0.2em] text-amber-500/80 mb-4 font-semibold">
              {committee || 'Hedef Belirlenmedi'}
            </h2>
            
            <div className="grid grid-cols-4 gap-2 md:gap-3 text-center mb-4">
              {Object.entries(timeLeft).map(([unit, val]) => (
                <div key={unit} className="bg-zinc-950/80 p-2 md:p-3 rounded-lg border border-zinc-800/50 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-mono font-bold text-zinc-100">
                    {val.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase text-amber-600/80 font-bold tracking-wider mt-1">
                    {unit === 'd' ? 'Gün' : unit === 'h' ? 'Saat' : unit === 'm' ? 'Dak' : 'Sn'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
            Eşik: {date ? new Date(date).toLocaleDateString('tr-TR') : '---'}
          </p>
        </>
      )}
    </div>
  )
}