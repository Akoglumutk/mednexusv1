"use client"
import { useState } from 'react'
import { Edit3, Plus, Trash2, Check, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function ScheduleCard({ initialSchedule }: { initialSchedule: any[] }) {
  const [isEditing, setIsEditing] = useState(false)
  const [rows, setRows] = useState(initialSchedule || [])
  const supabase = createClient()

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return;

      await supabase.from('settings').upsert({ 
        id: 1, // Or dynamic ID if available
        today_schedule: rows,
        user_id: user.id 
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update schedule", error)
    }
  }

  const cancelEdit = () => {
    setRows(initialSchedule || []);
    setIsEditing(false);
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 p-5 md:p-6 rounded-xl relative h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <h2 className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-semibold">
          Günün Planı
        </h2>
        
        {/* MOBİL UYUMLU KONTROLLER */}
        <div className="flex gap-2">
          {isEditing ? (
             <>
               <button onClick={cancelEdit} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-all active:scale-90">
                 <X size={16} />
               </button>
               <button onClick={handleSave} className="p-1.5 text-emerald-500 hover:bg-emerald-900/20 rounded transition-all active:scale-90">
                 <Check size={16} />
               </button>
             </>
          ) : (
             <button onClick={() => setIsEditing(true)} className="p-1.5 text-zinc-500 hover:text-amber-500 hover:bg-zinc-800 rounded transition-all active:scale-90">
               <Edit3 size={16} />
             </button>
          )}
        </div>
      </div>
      
      {/* Kaydırılabilir İçerik Alanı */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[250px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {rows.length === 0 && !isEditing && (
          <p className="text-xs text-zinc-600 italic text-center py-4">Program girilmedi.</p>
        )}

        {rows.map((row: any, i: number) => (
          <div key={i} className={`flex gap-3 items-center ${isEditing ? 'bg-zinc-950 p-2 rounded-lg border border-zinc-800' : 'py-2 border-b border-zinc-800/30 last:border-0'}`}>
            {isEditing ? (
              <>
                <input 
                  type="time"
                  value={row.time} 
                  onChange={(e) => {
                    const newRows = [...rows]; newRows[i].time = e.target.value; setRows(newRows);
                  }} 
                  className="w-24 bg-transparent border-r border-zinc-800 text-xs p-1 text-amber-500 outline-none [color-scheme:dark]" 
                />
                <input 
                  value={row.subject} 
                  placeholder="Ders/Konu..."
                  onChange={(e) => {
                    const newRows = [...rows]; newRows[i].subject = e.target.value; setRows(newRows);
                  }} 
                  className="flex-1 bg-transparent text-xs p-1 text-zinc-200 outline-none" 
                />
                <button 
                  onClick={() => setRows(rows.filter((_, idx) => idx !== i))} 
                  className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-900/20 rounded transition-all"
                >
                  <Trash2 size={14}/>
                </button>
              </>
            ) : (
              <div className="w-full flex items-start gap-4">
                <span className="text-amber-600/80 font-mono text-xs font-bold shrink-0 mt-0.5">{row.time}</span>
                <span className="text-zinc-300 text-sm leading-tight">{row.subject}</span>
              </div>
            )}
          </div>
        ))}

        {isEditing && (
          <button 
            onClick={() => setRows([...rows, { time: "09:00", subject: "" }])} 
            className="w-full mt-2 border border-dashed border-zinc-700 py-3 rounded-lg text-[10px] text-zinc-500 hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-900/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus size={14} /> Oturum Ekle
          </button>
        )}
      </div>
    </div>
  )
}