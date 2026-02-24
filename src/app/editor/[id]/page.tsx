import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EditorEngine from '@/components/Editor/EditorEngine'

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // 1. Fetch Document
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !document) {
    redirect('/editor')
  }

  // 2. Render Engine
  return (
    <div className="min-h-[100dvh] bg-[#050505] overflow-y-auto">
      <EditorEngine 
        initialContent={document.content} 
        noteId={document.id}
        title={document.title}
      />
    </div>
  )
}