"use client"
import dynamic from 'next/dynamic'

// We move the dynamic import logic here, inside a Client Component
const MedCanvas = dynamic(() => import('./MedCanvas'), { 
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-[#050505] text-zinc-500 font-mono text-sm">
      Loading Studio...
    </div>
  )
})

export default function CanvasWrapper({ initialData }: { initialData: any }) {
  return <MedCanvas initialData={initialData} />
}