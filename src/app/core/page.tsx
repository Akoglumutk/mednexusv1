"use client"
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, Clock, Calendar } from 'lucide-react'

export default function SynapsePage() {
  const supabase = createClient()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState<{ time: string, text: string }[]>([])
  const [isSending, setIsSending] = useState(false)
  const [docId, setDocId] = useState<string | null>(null)
  const [todayDate, setTodayDate] = useState('')

  // 1. INIT: FIND OR CREATE TODAY'S LOG
  useEffect(() => {
    const initDailyLog = async () => {
      const dateStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
      setTodayDate(dateStr)

      // Search for existing file
      let { data: file } = await supabase
        .from('documents')
        .select('id, content')
        .eq('title', `Daily Log: ${dateStr}`)
        .single()

      // Create if missing
      if (!file) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: newFile } = await supabase
          .from('documents')
          .insert([{
            title: `Daily Log: ${dateStr}`,
            content: { type: 'doc', content: [] }, // Empty Tiptap JSON
            user_id: user.id,
            root_directory: 'scripts', // Goes to Scripts folder
            is_folder: false
          }])
          .select()
          .single()
        
        file = newFile
      }

      if (file) {
        setDocId(file.id)
        // Parse existing content (Simulated extraction from Tiptap JSON for viewing)
        // In a real app, you'd parse the JSON properly. 
        // For V1, we start empty in this view to encourage "Capture" not "Review".
      }
    }
    initDailyLog()
  }, [])

  // 2. SEND: APPEND TO FILE
  const handleSend = async () => {
    if (!input.trim() || !docId) return
    setIsSending(true)

    const text = input
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    // Optimistic UI Update
    setLogs(prev => [...prev, { time, text }])
    setInput('')
    
    // Auto-scroll
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

    // Append to Supabase (We just fetch the current JSON, add a paragraph, and save)
    // NOTE: This is a "Blind Append" for speed. 
    const { data: currentDoc } = await supabase.from('documents').select('content').eq('id', docId).single()
    
    const newParagraph = {
      type: 'paragraph',
      content: [
        { type: 'text', text: `[${time}] ${text}` }
      ]
    }

    const currentContent = currentDoc?.content || { type: 'doc', content: [] }
    // Ensure content array exists
    if (!currentContent.content) currentContent.content = []
    
    // Append
    const updatedContent = {
      ...currentContent,
      content: [...currentContent.content, newParagraph]
    }

    await supabase
      .from('documents')
      .update({ content: updatedContent })
      .eq('id', docId)

    setIsSending(false)
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-black text-zinc-100">
      
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900 bg-zinc-950">
        <button onClick={() => router.push('/')} className="p-2 -ml-2 text-zinc-500 hover:text-white">
            <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
               <Calendar size={10} /> {todayDate}
            </span>
            <span className="font-serif font-bold text-lg">The Synapse</span>
        </div>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* LOG STREAM */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
         {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4 opacity-50">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                    <Send size={24} />
                </div>
                <p className="text-xs font-mono uppercase">Capture Stream Ready</p>
            </div>
         )}
         
         {logs.map((log, i) => (
            <div key={i} className="animate-in slide-in-from-bottom-2 fade-in">
                <div className="flex items-center gap-2 mb-1 opacity-50">
                    <Clock size={10} className="text-amber-500"/>
                    <span className="text-[10px] font-mono text-amber-500">{log.time}</span>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none text-sm leading-relaxed shadow-lg">
                    {log.text}
                </div>
            </div>
         ))}
         <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-900">
        <div className="relative flex items-end gap-2">
            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Capture thought..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none min-h-[50px] max-h-[120px]"
                rows={1}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                    }
                }}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="p-3 rounded-full bg-amber-500 text-black shadow-lg shadow-amber-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
                {isSending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20} />}
            </button>
        </div>
      </div>

    </div>
  )
}