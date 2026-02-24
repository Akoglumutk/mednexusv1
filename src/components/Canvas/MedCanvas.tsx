"use client"
import { useEffect, useState, useCallback } from 'react'
import { Tldraw, Editor, getSnapshot, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Cloud, CheckCircle2, Tag } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import debounce from 'lodash.debounce'

export default function MedCanvas({ initialData }: { initialData: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState(initialData.title)
  const [tags, setTags] = useState<string[]>(initialData.tags || [])
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false)

  const availableTags = ["Anatomy", "Histology", "Physiology", "Pathology", "T1C1", "T1C2", "T1C3", "Clinical"]

  const saveToSupabase = async (snapshot: any) => {
    setSaveStatus('saving')
    const { error } = await supabase.from('canvases').update({ data: snapshot, last_accessed_at: new Date().toISOString() }).eq('id', initialData.id)
    if (error) { console.error(error); setSaveStatus('error') } else { setSaveStatus('saved') }
  }
  const debouncedSave = useCallback(debounce((snapshot) => saveToSupabase(snapshot), 1000), [])

  const updateMeta = async (newTitle: string, newTags: string[]) => {
    setTitle(newTitle); setTags(newTags);
    await supabase.from('canvases').update({ title: newTitle, tags: newTags }).eq('id', initialData.id)
  }
  const toggleTag = (tag: string) => {
    const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    updateMeta(title, newTags)
  }

  const handleMount = (editor: Editor) => {
    if (initialData.data && Object.keys(initialData.data).length > 0) {
      try { loadSnapshot(editor.store, initialData.data) } catch (e) { console.error(e) }
    }
    return editor.store.listen((entry) => {
        if (entry.source === 'user') debouncedSave(getSnapshot(editor.store))
    })
  }

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-[#050505] overflow-hidden">
      
      {/* HUD OVERLAY */}
      {/* Mobile: Anchored at bottom (safe from tools). PC: Bottom left. */}
      <div className="fixed bottom-4 left-4 right-4 md:right-auto md:bottom-6 md:left-6 z-[9999] flex flex-col gap-3 pointer-events-none items-start">
        
        {/* Row 1: Back Button */}
        <button onClick={() => router.push('/canvas')} className="pointer-events-auto p-3 bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded-xl text-zinc-400 hover:text-white shadow-2xl">
          <ArrowLeft size={20} />
        </button>

        {/* Row 2: Controls */}
        <div className="pointer-events-auto bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded-xl p-2 shadow-2xl flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
           <input 
             value={title} onChange={(e) => updateMeta(e.target.value, tags)}
             className="bg-transparent text-zinc-200 font-bold font-serif outline-none w-32 md:w-56 px-2 text-sm placeholder:text-zinc-700"
             placeholder="Untitled"
           />
           <div className="w-[1px] h-4 bg-zinc-800" />
           
           <div className="relative">
              <button onClick={() => setIsTagMenuOpen(!isTagMenuOpen)} className={`p-1.5 rounded-lg border flex items-center gap-2 ${tags.length > 0 ? 'bg-amber-900/20 border-amber-500/30 text-amber-500' : 'border-transparent text-zinc-500'}`}>
                <Tag size={14} />
                {tags.length > 0 && <span className="text-[10px] font-mono font-bold">{tags[0]}</span>}
              </button>
              {isTagMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl p-1 shadow-2xl animate-in slide-in-from-bottom-2">
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {availableTags.map(tag => (
                        <button key={tag} onClick={() => toggleTag(tag)} className={`w-full text-xs text-left px-3 py-2 rounded-lg font-mono flex justify-between ${tags.includes(tag) ? 'text-amber-500 bg-amber-900/20' : 'text-zinc-400'}`}>
                            {tag} {tags.includes(tag) && <CheckCircle2 size={12} />}
                        </button>
                        ))}
                    </div>
                  </div>
              )}
           </div>

           <div className="w-[1px] h-4 bg-zinc-800" />
           <div className="flex items-center justify-center min-w-[24px]">
             {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin text-amber-500" /> : <Cloud size={14} className="text-emerald-500/50" />}
           </div>
        </div>
      </div>

      {/* CANVAS ENGINE */}
      <div className="absolute inset-0 z-0 tldraw-wrapper">
        <Tldraw 
          onMount={handleMount}
          options={{ maxPages: 1 }}
          inferDarkMode={true}
          // 1. THE GRID FIX: Explicitly enabling it via prop
          showGrid={true}
        />
      </div>

      {/* CSS OVERRIDES */}
      <style jsx global>{`
        .tldraw-wrapper .tl-container { background-color: #050505 !important; }
        .tldraw-wrapper {
            --color-text: #e4e4e7; --color-text-3: #a1a1aa;
            --color-background: #050505; --color-surface: #18181b;
            --color-primary: #f59e0b; --color-grid: #52525b;
        }

        /* 2. GRID VISIBILITY */
        .tl-grid { opacity: 0.3 !important; }

        /* 3. MOBILE LIFT: Move Tldraw Toolbar UP on small screens */
        @media (max-width: 768px) {
            .tl-ui-toolbar {
                bottom: 100px !important; /* Lifts tools above our HUD */
                padding: 0 12px; /* Adds breathing room */
            }
            .tl-ui-style-panel {
                bottom: 160px !important; /* Lifts the color picker even higher */
            }
        }
        
        /* PC: Keep standard */
        @media (min-width: 769px) {
            .tl-ui-toolbar { bottom: 20px !important; }
        }

        .tl-ui-menu-button { display: flex !important; background-color: #18181b !important; border: 1px solid #27272a !important; border-radius: 8px !important; }
        .tl-ui-button-icon { color: #a1a1aa !important; }
        .tl-ui-button-icon:hover { color: #fbbf24 !important; }
      `}</style>
    </div>
  )
}