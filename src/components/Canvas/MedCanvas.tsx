"use client"
import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Cloud, Loader2, CheckCircle2, Tag, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import debounce from 'lodash.debounce'

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-[#050505] text-zinc-600 font-mono text-xs">
            Initializing Engine...
        </div>
    ),
  }
)

export default function MedCanvas({ initialData }: { initialData: any }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [title, setTitle] = useState(initialData.title)
  const [tags, setTags] = useState<string[]>(initialData.tags || [])
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false)
  
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const availableTags = ["Anatomy", "Histology", "Physiology", "Pathology", "T1C1", "T1C2", "Clinical"]

  const saveToSupabase = async (elements: any, appState: any) => {
    setSaveStatus('saving')
    // We strictly save only what Excalidraw gives us
    const snapshot = { elements, appState: { ...appState, collaborators: [] } }
    
    const { error } = await supabase
        .from('canvases')
        .update({ 
            data: snapshot, 
            last_accessed_at: new Date().toISOString() 
        })
        .eq('id', initialData.id)

    if (error) { console.error(error); setSaveStatus('error') } 
    else { setSaveStatus('saved') }
  }

  const debouncedSave = useCallback(
    debounce((elements, appState) => saveToSupabase(elements, appState), 1000), 
    []
  )

  const updateMeta = async (newTitle: string, newTags: string[]) => {
    setTitle(newTitle); setTags(newTags);
    await supabase.from('canvases').update({ title: newTitle, tags: newTags }).eq('id', initialData.id)
  }

  const toggleTag = (tag: string) => {
    const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    updateMeta(title, newTags)
  }

  // --- CLEAN SLATE LOAD LOGIC ---
  useEffect(() => {
    if (excalidrawAPI && !isLoaded) {
      // We only try to load if the data looks perfectly like Excalidraw
      // Otherwise, we intentionally do nothing (load blank) to avoid crashes
      if (initialData.data && initialData.data.elements && Array.isArray(initialData.data.elements)) {
        try {
          excalidrawAPI.updateScene({
              elements: initialData.data.elements,
              appState: initialData.data.appState
          })
        } catch (e) {
          console.warn("Resetting canvas due to format mismatch.")
        }
      } 
      // Mark as loaded so we can start saving new edits
      setIsLoaded(true)
    }
  }, [excalidrawAPI, initialData.data, isLoaded])

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-[#121212] overflow-hidden">
      
      {/* HUD OVERLAY */}
      <div className="fixed bottom-4 left-4 right-4 md:right-auto md:bottom-6 md:left-6 z-[50] flex flex-col gap-3 pointer-events-none items-start">
        
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

      <div className="absolute inset-0 z-0 h-full w-full">
        <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            theme="dark"
            onChange={(elements, appState) => {
                // Only save AFTER we have confirmed the load sequence is done
                if (isLoaded) {
                    debouncedSave(elements, appState)
                }
            }}
            initialData={{
                appState: { 
                    viewBackgroundColor: "#050505", 
                    currentItemStrokeColor: "#fbbf24",
                    gridSize: 20
                }
            }}
        />
      </div>

      <style jsx global>{`
        .App-menu__left, .App-top-bar { display: none !important; }
        .excalidraw { --color-primary: #f59e0b; }
        .excalidraw .layer-ui__wrapper { background-color: transparent !important; }
        @media (max-width: 768px) {
            .App-bottom-bar { margin-bottom: 80px !important; }
        }
      `}</style>
    </div>
  )
}
