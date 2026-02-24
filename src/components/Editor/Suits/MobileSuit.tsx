import { EditorContent } from '@tiptap/react'
import { Plus, MoreHorizontal, Undo2, Redo2, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

export function MobileSuit({ editor, title, handleTitleChange, saveStatus, fileInputRef, handleImageUpload }: any) {
  const [showMenu, setShowMenu] = useState(false)

  if (!editor) return null

  return (
    <div className="flex flex-col min-h-screen bg-black pb-20">
      
      {/* MOBILE HEADER: Minimalist */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 h-14">
        <input 
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="bg-transparent text-lg font-bold text-zinc-200 outline-none w-full placeholder:text-zinc-700 font-serif"
        />
        <div className="text-[10px] font-mono uppercase text-zinc-600">
          {saveStatus === 'saving' ? 'Syncing...' : 'Saved'}
        </div>
      </div>

      {/* MOBILE STREAM CANVAS */}
      <div className="flex-1 p-4">
        <EditorContent editor={editor} className="tiptap-mobile-stream" />
      </div>

      {/* FLOATING ACTION BUTTON (FAB) MENU */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        
        {showMenu && (
          <div className="flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className="p-3 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-300 shadow-lg"><span className="font-bold font-serif">B</span></button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-3 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-300 shadow-lg">List</button>
            <button onClick={() => editor.chain().focus().undo().run()} className="p-3 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-300 shadow-lg"><Undo2 size={20}/></button>
            <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-zinc-900 border border-zinc-700 rounded-full text-emerald-500 shadow-lg"><ImageIcon size={20}/></button>
          </div>
        )}

        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={`p-4 rounded-full shadow-2xl transition-all active:scale-90 ${showMenu ? 'bg-amber-500 text-black rotate-45' : 'bg-zinc-100 text-black'}`}
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
    </div>
  )
}