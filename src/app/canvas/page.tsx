import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, LayoutGrid, Tag, Filter } from 'lucide-react'
import { CreateCanvasButton } from '@/components/Canvas/CreateCanvasButton'
import DeleteCanvasButton from '@/components/Canvas/DeleteCanvasButton'

export default async function CanvasGallery({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const resolvedParams = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // QUERY BUILDER
  let query = supabase.from('canvases').select('*').order('last_accessed_at', { ascending: false })
  
  // Apply Filter if tag is present
  if (resolvedParams.tag) {
    query = query.contains('tags', [resolvedParams.tag])
  }

  const { data: canvases } = await query

  // Available filters (Matching your Canvas options)
  const filters = ["Anatomy", "Biochemistry", "Embriology", "Genetics", "Histology", "Med. Bio.", "Microbiology", "Pathology", "Pharmacology", "Physiology", "T1C1", "T1C2", "T1C3", "T1C4", "T2C2", "T2C3","T2C4", "T2C5", "T2C6", "Clinical"];


  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-12 pb-32">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-zinc-100">The Studio</h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
            Infinite Canvas Repository {resolvedParams.tag && ` / ${resolvedParams.tag}`}
          </p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors border border-transparent hover:border-zinc-800 rounded-full">
          BACK TO DASHBOARD
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto mb-10 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
         <div className="flex items-center gap-2 pr-4 border-r border-zinc-800 mr-2 text-zinc-600">
            <Filter size={14} />
            <span className="text-[10px] font-mono uppercase tracking-widest">Filter</span>
         </div>

         <Link 
           href="/canvas" 
           className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all whitespace-nowrap ${
              !resolvedParams.tag ? 'bg-zinc-100 text-black border-zinc-100 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'
           }`}
         >
           ALL
         </Link>
         
         {filters.map(tag => (
           <Link 
             key={tag} 
             href={`/canvas?tag=${tag}`}
             className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all whitespace-nowrap flex items-center gap-2 ${
                resolvedParams.tag === tag ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-amber-900/50 hover:text-amber-500'
             }`}
           >
             {tag}
           </Link>
         ))}
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Create Button (Only show if no filter is active to keep UI clean, or always show) */}
        {!resolvedParams.tag && <CreateCanvasButton userId={user.id} />}

        {/* Canvases */}
        {canvases?.map((canvas) => (
          <div key={canvas.id} className="group relative aspect-[4/3] bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-900/50 transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            
            <Link href={`/canvas/${canvas.id}`} className="absolute inset-0 flex flex-col p-6 z-10">
              <div className="flex-1 flex items-center justify-center opacity-10 group-hover:opacity-30 transition-all scale-95 group-hover:scale-100 duration-500">
                <LayoutGrid size={48} strokeWidth={1} />
              </div>
              <div className="mt-auto">
                <h3 className="text-lg font-bold text-zinc-300 group-hover:text-amber-400 transition-colors truncate font-serif">
                    {canvas.title}
                </h3>
                
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono uppercase">
                        <Clock size={12} />
                        <span>{new Date(canvas.last_accessed_at).toLocaleDateString()}</span>
                    </div>

                    {/* Show first tag if exists */}
                    {canvas.tags && canvas.tags.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-amber-500/70 bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-900/30">
                            <Tag size={10} />
                            <span>{canvas.tags[0]}</span>
                        </div>
                    )}
                </div>
              </div>
            </Link>

            {/* DELETE BUTTON */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
               <DeleteCanvasButton id={canvas.id} />
            </div>

          </div>
        ))}

        {canvases?.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500 opacity-50">
                <LayoutGrid size={48} className="mb-4" />
                <p className="font-mono text-sm">NO CANVASES FOUND</p>
            </div>
        )}

      </div>
    </div>
  )
}