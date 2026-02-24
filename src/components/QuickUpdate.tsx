"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Save, TerminalSquare } from 'lucide-react'

export function QuickUpdate({ currentData }: { currentData: any }) {
  const [isEditing, setIsEditing] = useState(false)
  
  // JSON parse hatalarını önlemek için güvenli başlangıç
  const initialSchedule = typeof currentData?.today_schedule === 'string' 
    ? currentData.today_schedule 
    : JSON.stringify(currentData?.today_schedule || [], null, 2)
    
  const [schedule, setSchedule] = useState(initialSchedule)
  const [committee, setCommittee] = useState(currentData?.current_committee || '')
  const supabase = createClient()

  const handleUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return;
      
      let parsedSchedule;
      try {
        parsedSchedule = JSON.parse(schedule);
      } catch (e) {
        alert("JSON formatı hatalı. Lütfen kontrol edin.");
        return;
      }

      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: currentData?.id || 1, 
          today_schedule: parsedSchedule,
          current_committee: committee,
          user_id: user.id
        })
      if (error) throw error
      
      setIsEditing(false)
      window.location.reload()
    } catch (e) {
      alert("Veritabanı güncellenirken hata oluştu.")
    }
  }

  return (
    <div className="mt-8 md:mt-12 border-t border-zinc-800/50 pt-8 mb-20 md:mb-0">
      <button 
        onClick={() => setIsEditing(!isEditing)} 
        className="flex items-center gap-2 text-[10px] text-zinc-500 hover:text-amber-500 transition-colors uppercase tracking-widest font-mono active:scale-95 outline-none"
      >
        <TerminalSquare size={14} /> {isEditing ? 'Konsolu Kapat' : 'Geliştirici Konsolu (Raw JSON)'}
      </button>

      {isEditing && (
        <div className="mt-4 bg-zinc-950 border border-zinc-800 p-4 md:p-6 rounded-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-amber-600/80 font-bold block">Aktif Kurul/Komite</label>
              <input 
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg text-sm text-zinc-100 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-amber-600/80 font-bold block">Günlük Program (Raw JSON)</label>
              <textarea 
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                rows={6}
                className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs font-mono text-zinc-400 focus:border-amber-500/50 focus:text-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all scrollbar-thin scrollbar-thumb-zinc-800"
              />
            </div>
          </div>
          <button 
            onClick={handleUpdate} 
            className="mt-6 w-full md:w-auto bg-amber-600/20 text-amber-500 border border-amber-600/50 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} /> Sistemi Güncelle
          </button>
        </div>
      )}
    </div>
  )
}