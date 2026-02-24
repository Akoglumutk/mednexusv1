// ./src/app/editor/layout.tsx
import UniversalSidebar from '@/components/Editor/UniversalSidebar' // <--- No curly braces!

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  // We keep the layout simple; the Sidebar component itself will 
  // handle its own visibility based on the URL path.
  return (
    <div className="flex h-[100dvh] bg-[#050505] overflow-hidden text-zinc-100">
      <UniversalSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {children}
      </main>
    </div>
  )
}