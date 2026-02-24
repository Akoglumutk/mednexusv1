// ImageOcclusionExtension.ts
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageOcclusionWrapper from './ImageOcclusionWrapper'

export interface Annotation {
  id: string;
  type: 'occlusion' | 'arrow' | 'text';
  x: number; y: number; w: number; h: number;
  revealed?: boolean;
  content?: string;
}

export const ImageOcclusion = Node.create({
  name: 'imageOcclusion',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      // Generate a unique ID for the node itself to scope SVG markers
      nodeId: { default: () => `io-${Math.random().toString(36).slice(2)}` }, 
      annotations: { default: [] },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-occlusion"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-occlusion' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageOcclusionWrapper)
  },
})