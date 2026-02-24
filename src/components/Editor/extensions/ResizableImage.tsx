import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import Image from '@tiptap/extension-image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { GripHorizontal } from 'lucide-react'

// 1. THE REACT COMPONENT (The View)
const ResizableImageView = (props: any) => {
  const { src, width, alt } = props.node.attrs
  const [isResizing, setIsResizing] = useState(false)
  const [currentWidth, setCurrentWidth] = useState(width || '100%')
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync width from props if it changes externally
  useEffect(() => {
    if (width) setCurrentWidth(width)
  }, [width])

  // --- RESIZE HANDLERS ---
  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    setIsResizing(true)
  }

  const handleResizeMove = useCallback((e: PointerEvent) => {
    if (!isResizing || !containerRef.current) return
    const newWidth = e.clientX - containerRef.current.getBoundingClientRect().left
    // Min 200px, Max 100% (handled by max-w-full in CSS)
    setCurrentWidth(`${Math.max(200, newWidth)}px`)
  }, [isResizing])

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false)
      props.updateAttributes({ width: currentWidth })
    }
  }, [isResizing, currentWidth, props])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('pointermove', handleResizeMove)
      window.addEventListener('pointerup', handleResizeEnd)
    }
    return () => {
      window.removeEventListener('pointermove', handleResizeMove)
      window.removeEventListener('pointerup', handleResizeEnd)
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  // Resolve Alignment Classes
  const getAlignClass = () => {
    if (props.node.attrs.class?.includes('float-left')) return 'float-left mr-6 mb-4'
    if (props.node.attrs.class?.includes('float-right')) return 'float-right ml-6 mb-4'
    return 'mx-auto block'
  }

  return (
    <NodeViewWrapper className={`relative my-8 group ${getAlignClass()} max-w-full`} style={{ width: 'fit-content' }}>
      <div 
        ref={containerRef}
        style={{ width: currentWidth }}
        className={`
          relative rounded-xl overflow-hidden shadow-2xl transition-all max-w-full
          ${props.selected ? 'ring-2 ring-indigo-500/50' : ''}
        `}
      >
        <img 
          src={src} 
          alt={alt} 
          className="block w-full h-auto select-none pointer-events-none" 
        />

        {/* RESIZE HANDLE - Only visible when selected and editable */}
        {props.editor.isEditable && props.selected && (
          <div 
            onPointerDown={handleResizeStart}
            className="absolute bottom-0 right-0 p-2 cursor-col-resize text-white/80 hover:text-white z-50 bg-black/50 hover:bg-indigo-600 rounded-tl-xl transition-colors backdrop-blur-sm touch-none"
          >
            <GripHorizontal size={20} />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

// 2. THE TIPTAP EXTENSION (The Export)
// We extend the default 'Image' extension but replace its view with our React component.
const ResizableImage = Image.extend({
  name: 'image', // Keep name 'image' so it overrides the default image handler

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      class: {
        default: 'mx-auto block',
      }
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  }
})

export default ResizableImage