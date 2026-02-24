"use client"
import { useEffect, useState, useCallback, useRef } from 'react'
import { useEditor } from '@tiptap/react'
import debounce from 'lodash.debounce'
import { createClient } from '@/utils/supabase/client'
// Extensions
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { ImageOcclusion } from './ImageOcclusionExtension'
import { PageBreak } from './PageBreakExtension'
import { MedTag } from './MedTagExtension'
import { uploadImage } from '@/utils/uploadImage'

// Import Suits
import { MobileSuit } from './Suits/MobileSuit'
import { DesktopSuit } from './Suits/DesktopSuit'
import { getCookie } from 'cookies-next'

interface TiptapEditorProps { initialDoc: any; userId: string; }

export function TiptapEditor({ initialDoc, userId }: TiptapEditorProps) {
  // --- 1. CORE LOGIC (Shared Brain) ---
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const supabase = createClient()
  const titleRef = useRef(initialDoc.title)
  const [title, setTitle] = useState(initialDoc.title)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveToDatabase = async (jsonContent: any, currentTitle: string) => {
    setSaveStatus('saving')
    try {
      await supabase.from('documents').update({ content: jsonContent, title: currentTitle, updated_at: new Date().toISOString() }).eq('id', initialDoc.id)
      setSaveStatus('saved')
    } catch (e) { setSaveStatus('error') }
  }

  const debouncedSave = useCallback(debounce((json, t) => saveToDatabase(json, t), 1500), [initialDoc.id])

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value); titleRef.current = e.target.value;
    if (editor) debouncedSave(editor.getJSON(), e.target.value)
  }

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setSaveStatus('saving');
    const url = await uploadImage(file);
    if (url) {
      editor.chain().focus().insertContent({ type: 'imageOcclusion', attrs: { src: url, annotations: [] } }).run();
      setSaveStatus('saved');
    }
  }

  // --- 2. ENGINE INITIALIZATION ---
  const editor = useEditor({
    extensions: [StarterKit, Highlight, TextStyle, Color, ImageOcclusion, PageBreak, MedTag],
    content: initialDoc.content || {},
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'tiptap focus:outline-none' },
      handlePaste: (view, event, slice) => {
        const item = event.clipboardData?.items[0];
        if (item?.type.indexOf("image") === 0) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            // Use your existing upload logic
            uploadImage(file).then((url) => {
              if (url) {
                const { schema } = view.state;
                const node = schema.nodes.imageOcclusion.create({ src: url, annotations: [] });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            });
          }
          return true; // Handled
        }
        return false; // Default behavior for text
      },
    },
    onUpdate: ({ editor }) => { setSaveStatus('saving'); debouncedSave(editor.getJSON(), titleRef.current) },
  })

  if (!editor) return null

  // --- 3. TRAFFIC CONTROL (Responsive Switching) ---
  const deviceMode = getCookie('mednexus_device_mode') || 'desktop';
  const sharedProps = { editor, title, handleTitleChange, saveStatus, fileInputRef, handleImageUpload }

  if (deviceMode === 'mobile') {
    return <MobileSuit {...sharedProps} />
  }

  if (deviceMode === 'tablet') {
    // For now, Tablet uses DesktopSuit but we can fork it later easily
    return <DesktopSuit {...sharedProps} isTabletMode={true} /> 
  }  

  // Default: THE ARCHITECT (PC)
  return <DesktopSuit {...sharedProps} />
}