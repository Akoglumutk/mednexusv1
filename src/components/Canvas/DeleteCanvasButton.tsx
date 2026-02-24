"use client"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

// CHANGED: Added 'default' keyword
export default function DeleteCanvasButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    
    if(!confirm("Destroy this canvas permanently?")) return;

    await supabase.from('canvases').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button 
      onClick={handleDelete} 
      className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-500 hover:text-red-500 hover:border-red-900 transition-all z-20 relative"
    >
      <Trash2 size={14} />
    </button>
  )
}