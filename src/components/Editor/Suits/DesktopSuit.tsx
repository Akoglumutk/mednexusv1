import { EditorContent } from '@tiptap/react'
import { PanelLeftOpen, Save, Loader2, Undo2, Redo2, Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Highlighter, Scissors, Image as ImageIcon } from 'lucide-react'

export function DesktopSuit({ editor, title, handleTitleChange, saveStatus, fileInputRef, handleImageUpload, isTabletMode }: any) {
  if (!editor) return null

  // --- HELPER COMPONENT DEFINITION ---
  const ToolbarButton = ({ onClick, isActive, icon: Icon, colorClass = "text-zinc-400" }: any) => (
    <button 
      onClick={onClick} 
      className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-amber-900/20 text-amber-500' : `hover:bg-zinc-800 ${colorClass}`}`}
    >
      <Icon size={18} />
    </button>
  )

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] relative overflow-hidden">
      
      {/* 1. TOP BAR: Strict Desktop Layout */}
      <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/95 flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-4 w-1/3">
             {/* We can remove the hamburger menu if Sidebar is always visible on PC */}
             <span className="text-zinc-500 text-xs font-mono">CMD+P to Search</span>
          </div>

          <div className="w-1/3 flex justify-center">
             <input 
               value={title} 
               onChange={handleTitleChange} 
               className="bg-transparent text-center text-sm font-bold text-zinc-200 outline-none w-full font-serif placeholder:text-zinc-700" 
               placeholder="Untitled Document" 
             />
          </div>

          <div className="w-1/3 flex justify-end items-center gap-3">
             {saveStatus === 'saving' && <span className="text-xs text-amber-500 animate-pulse">Saving...</span>}
             {saveStatus === 'saved' && <span className="text-xs text-zinc-600">Synced</span>}
          </div>
      </div>

      {/* 2. THE WORKSPACE: Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR (Always open on PC) */}
        <div className="w-64 border-r border-zinc-800 bg-zinc-950/50 hidden lg:block">
           {/* We can embed the Sidebar component directly here later */}
           <div className="p-4 text-zinc-500 text-xs">Library Structure</div>
        </div>

        {/* EDITOR STAGE */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#080808] relative">
          
          {/* FLOATING TOOLBAR (The "Island" Design) */}
          {/* Toolbar Row */}
          <div className="h-10 flex items-center justify-center gap-1 px-4 bg-zinc-900/30">
              <ToolbarButton onClick={() => editor.chain().undo().run()} icon={Undo2} />
              <ToolbarButton onClick={() => editor.chain().redo().run()} icon={Redo2} />
              <div className="w-[1px] h-4 bg-zinc-700 mx-2" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} icon={Bold} />
              <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} icon={Italic} />
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={Heading1} />
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={Heading2} />
              <div className="w-[1px] h-4 bg-zinc-700 mx-2" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} icon={List} />
              <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={ListOrdered} />
               {/* ... Add other buttons (Image, Tags) here ... */}
               <button onClick={() => fileInputRef.current?.click()} className="p-2 text-emerald-500 hover:bg-zinc-800 rounded"><ImageIcon size={18}/></button>
          </div>
        </div>

          {/* THE A4 PAGE */}
          <div className="flex justify-center pb-32">
             <div className="editor-a4-page bg-[#0a0a0a] shadow-2xl min-h-[297mm] w-[210mm] p-[20mm] border border-zinc-800/50">
                <EditorContent editor={editor} />
             </div>
          </div>

        {/* ORACLE DRAWER (Right side, collapsible) */}
        {/* <div className="w-80 border-l border-zinc-800 bg-zinc-950">Oracle</div> */}

      </div>
    </div>
  )
}
