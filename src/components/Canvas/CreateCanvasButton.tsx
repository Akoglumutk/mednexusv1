"use client"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function CreateCanvasButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('canvases')
      .insert([{ 
        user_id: userId, 
        title: 'Untitled Concept',
        data: {} // Empty canvas state
      }])
      .select()
      .single()

    if (data) {
      router.push(`/canvas/${data.id}`)
    } else {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCreate}
      disabled={loading}
      className="aspect-[4/3] rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/80 hover:border-amber-500/50 transition-all flex flex-col items-center justify-center gap-4 group"
    >
      <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 group-hover:scale-110 transition-transform text-amber-500">
        {loading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">New Canvas</span>
    </button>
  )
}