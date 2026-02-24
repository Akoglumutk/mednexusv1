import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CanvasWrapper from '@/components/Canvas/CanvasWrapper'

export default async function CanvasRoom({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params // Await params in Next.js 16
  const supabase = await createClient()
  
  const { data: canvas } = await supabase
    .from('canvases')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!canvas) redirect('/canvas')

  return (
    <div className="fixed inset-0 bg-[#050505] overflow-hidden">
       <CanvasWrapper initialData={canvas} />
    </div>
  )
}