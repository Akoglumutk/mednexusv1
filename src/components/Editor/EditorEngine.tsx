"use client"
// 1. FIXED IMPORTS: BubbleMenu is exported directly from @tiptap/react in v2.4.0
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Image from '@tiptap/extension-image'

// FIXED: Named Imports for Extensions
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'

import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'

// Logic for Bubble Menu
import BubbleMenuExtension from '@tiptap/extension-bubble-menu' 

// Custom Extensions
import { MedTag, PageBreak, Spoiler } from '@/components/Editor/extensions'
import { ImageOcclusion } from '@/components/Editor/ImageOcclusionExtension'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import debounce from 'lodash.debounce'
import { 
  Bold, Italic, List, Heading2, Loader2, CheckCircle2, Save,
  ImageIcon, Table as TableIcon, AlertCircle, Scissors,
  Eye, Sparkles, Plus, Trash2, Columns, Rows,
  Maximize2, Minimize2, AlignCenter,
  Heading1,
  Underline,
  ListOrdered,
  X,
  AlignLeft,
  AlignRight
} from 'lucide-react'
import ResizableImage from './extensions/ResizableImage'

interface EditorProps {
  initialContent: any
  noteId: string
  title: string
}

export default function EditorEngine({ initialContent, noteId, title: initialTitle }: EditorProps) {
  const supabase = createClient()
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [title, setTitle] = useState(initialTitle)

  // Oracle State
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // ---------------------------------------------------------
  // ✦ THE NEURAL SIGNATURE ✦
  // ---------------------------------------------------------
  useEffect(() => {
    console.log(
      '%c HistoLab %c ✦ Logic Synthesized ',
      'background: #ef4444; color: #fff; border-radius: 3px 0 0 3px; padding: 4px 8px; font-weight: bold;',
      'background: #18181b; color: #a1a1aa; border-radius: 0 3px 3px 0; padding: 4px 8px; border: 1px solid #27272a; border-left: none;'
    );
  }, [])
  // ---------------------------------------------------------

  // Oracle Scribe Logic
  const runOracleScribe = async () => {
    if (!rawInput.trim()) return;
    setIsGenerating(true);
  
    try {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rawInput }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }
  
      const data = await response.json();
      
      if (data.output) {
        editor?.commands.setContent(data.output);
        setIsOracleOpen(false);
        setRawInput('');
      }
    } catch (error: any) {
      console.error("Oracle Scribe Error:", error);
      alert(`Oracle encountered an issue: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = event => {
            const url = event.target?.result as string;
            editor?.chain().focus().setImage({ src: url }).run();
        };
        reader.readAsDataURL(file);
    }
  }

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  }

  const addOcclusionImage = () => {
    const url = window.prompt('Enter URL for Study Image:')
    if (url) {
      // @ts-ignore
      editor?.chain().focus().insertContent({ type: 'imageOcclusion', attrs: { src: url } }).run()
    }
  }

  const MED_TAGS = [
    { id: 'exam', label: 'EXAM', color: '#ef4444', icon: 'E' },
    { id: 'note', label: 'NOTE', color: '#3b82b6', icon: 'N' },
    { id: 'warn', label: 'WARN', color: '#f59e0b', icon: 'W' },
    { id: 'drug', label: 'DRUG', color: '#10b981', icon: 'D' },
  ];

  const insertMedTag = (label: string, color: string) => {
    editor?.chain().focus().insertMedTag({ label, color }).run();
  };

  const saveToSupabase = async (content: any, currentTitle: string) => {
    setSaveStatus('saving')
    const { error } = await supabase
      .from('documents') 
      .update({ content: content, title: currentTitle, updated_at: new Date().toISOString() })
      .eq('id', noteId)

    if (error) { console.error(error); setSaveStatus('error') }
    else { setSaveStatus('saved') }
  }

  const debouncedSave = useCallback(
    debounce((content, currentTitle) => saveToSupabase(content, currentTitle), 1500), 
    []
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: { HTMLAttributes: { class: 'callout-block' } },
        dropcursor: { color: '#fbbf24', width: 2 }
      }),
      BubbleMenuExtension, 
      Typography,
      ResizableImage.configure({ inline: true, allowBase64: true }), 
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      TextStyle, Color, Highlight.configure({ multicolor: true }), 
      Placeholder.configure({ placeholder: "Start your protocol..." }),
      MedTag, PageBreak, Spoiler,
      ImageOcclusion
    ],
    content: initialContent || {},
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[60vh] px-8 py-10 bg-black border border-zinc-800 shadow-2xl rounded-xl selection:bg-amber-900/50',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => debouncedSave(editor.getJSON(), title),
  })

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    debouncedSave(editor?.getJSON(), e.target.value)
  }

  const insertTable = () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  const insertPageBreak = () => editor?.commands.setPageBreak()

  const convertToOcclusion = () => {
    if (!editor) return
    const { state } = editor.view
    const { selection } = state
    const node = state.doc.nodeAt(selection.from)
    
    if (node && node.type.name === 'image') {
      const src = node.attrs.src
      const width = node.attrs.width || '100%' 
      
      editor.chain().focus().deleteSelection().insertContent({ 
        type: 'imageOcclusion', 
        attrs: { src, width }
      }).run()
    }
  }
  
  if (!editor) return null

  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-amber-500/30">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-zinc-900/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <input 
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Protocol..."
              className="bg-transparent text-xl font-serif font-bold text-zinc-100 placeholder:text-zinc-800 outline-none w-full"
            />
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800">
             {saveStatus === 'saving' && <Loader2 size={12} className="animate-spin text-amber-500"/>}
             {saveStatus === 'saved' && <CheckCircle2 size={12} className="text-emerald-500"/>}
             {saveStatus === 'error' && <AlertCircle size={12} className="text-red-500"/>}
             <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-500">
               {saveStatus}
             </span>
          </div>
        </div>
      </header>
  
      {/* 2. MAIN EDITOR CANVAS */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <EditorContent editor={editor} />
      </main>
  
      {/* 3. FLOATING MAIN TOOLBAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 p-1.5 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <ToolbarBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={18} /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={18} /></ToolbarBtn>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={18} /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={18} /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={18} /></ToolbarBtn>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={18} /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={18} /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><AlertCircle size={18} /></ToolbarBtn>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          
          {/* IMAGE UPLOADS */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <ToolbarBtn active={false} onClick={triggerImageUpload}>
            <ImageIcon size={18} />
          </ToolbarBtn>

          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <ToolbarBtn active={editor.isActive('table')} onClick={insertTable}><TableIcon size={18} /></ToolbarBtn>
          <ToolbarBtn active={false} onClick={insertPageBreak}><Scissors size={18} /></ToolbarBtn>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          
          {/* MEDICAL TAG GROUP */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-xl border border-white/5">
            {MED_TAGS.map(tag => (
              <button
                key={tag.id}
                onClick={() => insertMedTag(tag.label, tag.color)}
                className="group relative flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: `${tag.color}15`, border: `1px solid ${tag.color}40` }}
                title={`Insert ${tag.label} tag`}
              >
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-zinc-700">
                  {tag.label}
                </span>
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
            
            {/* Oracle Trigger */}
            <button 
              onClick={() => setIsOracleOpen(true)} 
              className="p-2 text-amber-500 hover:bg-amber-500/10 hover:scale-110 active:scale-95 rounded-xl transition-all relative group"
            >
              <Sparkles size={18} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-zinc-700">
                Oracle Scribe
              </span>
            </button>
        </div>
      </div>

      {/* 4. ORACLE OVERLAY */}
        { isOracleOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => !isGenerating && setIsOracleOpen(false)} />

            <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-amber-500 animate-pulse" size={20} />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-zinc-100">Oracle Scribe</h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Transforming raw data into protocols</p>
                  </div>
                </div>
                <button onClick={() => setIsOracleOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <textarea
                autoFocus
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Paste raw transcripts, messy notes, or PDF text here..."
                className="flex-1 bg-transparent p-8 text-zinc-300 outline-none resize-none font-sans leading-relaxed placeholder:text-zinc-700 custom-scrollbar"
              />

              <div className="p-4 bg-black/20 border-t border-zinc-800 flex justify-end gap-3">
                <button 
                  onClick={() => setIsOracleOpen(false)}
                  className="px-6 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={runOracleScribe}
                  disabled={isGenerating || !rawInput.trim()}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGenerating ? 'Processing...' : 'Scribe Protocol'}
                </button>
              </div>
            </div>
          </div>
        )}
  
      {/* 5. BUBBLE MENUS */}
      <BubbleMenu 
        editor={editor} 
        shouldShow={({ editor }) => editor.isActive('image') || editor.isActive('imageOcclusion')}
      >
         <div className="flex items-center gap-1 p-1.5 bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-xl shadow-xl">
            {/* Standard Alignment Buttons */}
            <button onClick={() => editor.chain().focus().updateAttributes(editor.isActive('imageOcclusion') ? 'imageOcclusion' : 'image', { class: 'float-left mr-4' }).run()} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"><AlignLeft size={16}/></button>
            
            <button onClick={() => editor.chain().focus().updateAttributes(editor.isActive('imageOcclusion') ? 'imageOcclusion' : 'image', { class: 'mx-auto block' }).run()} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"><AlignCenter size={16}/></button>
            
            <button onClick={() => editor.chain().focus().updateAttributes(editor.isActive('imageOcclusion') ? 'imageOcclusion' : 'image', { class: 'float-right ml-4' }).run()} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"><AlignRight size={16}/></button>
            
            <div className="w-px h-4 bg-zinc-700 mx-1" />
            
            {/* Convert / Status Button */}
            {editor.isActive('image') && (
              <button 
                onClick={convertToOcclusion} 
                className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded transition-all flex items-center gap-1"
                title="Make Interactive"
              >
                <Eye size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider pr-1">Study</span>
              </button>
            )}
         </div>
      </BubbleMenu>
  
      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
          color: #d4d4d8;
          font-size: 1.125rem;
          line-height: 1.8;
        }
        .ProseMirror h2 {
          font-family: 'Georgia', serif;
          color: #fafafa;
          margin-top: 2.5em;
          margin-bottom: 0.5em;
          font-size: 1.8em;
        }
        .callout-block {
          border-left: 4px solid #f59e0b;
          background: rgba(245, 158, 11, 0.05);
          padding: 1.5rem;
          border-radius: 0 1rem 1rem 0;
          margin: 2rem 0;
        }
        .ProseMirror table {
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid #27272a;
          margin: 2rem 0;
        }
        .ProseMirror th {
          background: #18181b;
          color: #a1a1aa;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }
        .ProseMirror td { border: 1px solid #18181b; }
        .page-break-indicator {
          border-top: 2px dashed #27272a;
          margin: 4rem 0;
          position: relative;
        }
        .page-break-indicator::after {
          content: "PRINT PAGE BREAK";
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #050505;
          padding: 0 1rem;
          font-size: 10px;
          color: #3f3f46;
          font-family: monospace;
        }

        .med-tag-component {
          color: var(--tag-color);
          border: 1px solid var(--tag-color);
          background-color: color-mix(in srgb, var(--tag-color), transparent 90%);
          padding: 1px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 4px;
          display: inline-flex;
          align-items: center;
          vertical-align: middle;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        [data-type="med-tag"] {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          height: 1.5em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.7rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.025em;
          padding: 0 0.5rem;
          border-radius: 4px;
          user-select: none;
          cursor: default;
          white-space: nowrap;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }

        [data-type="med-tag"][color="#ef4444"] {
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  )
}

function ToolbarBtn({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick} 
      className={`
        p-2 rounded-lg transition-colors duration-200
        ${active ? 'text-amber-500 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}
      `}
    >
      {children}
    </button>
  )
}
