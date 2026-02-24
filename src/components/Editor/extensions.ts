// ./src/components/Editor/extensions.ts
import { mergeAttributes, Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    medTag: { insertMedTag: (options: { label: string; color: string }) => ReturnType }
    pageBreak: { setPageBreak: () => ReturnType }
    spoiler: { toggleSpoiler: () => ReturnType }
  }
}

export const MedTag = Node.create({
  name: 'medTag',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      label: { default: 'TAG' },
      color: { default: '#ef4444' },
    }
  },
  parseHTML: () => [{ tag: 'span[data-type="med-tag"]' }],
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      'data-type': 'med-tag',
      style: `color: ${HTMLAttributes.color}; border: 1px solid ${HTMLAttributes.color}; background-color: ${HTMLAttributes.color}15; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.7rem; font-weight: 700; margin: 0 4px; display: inline-block;`,
    }), HTMLAttributes.label]
  },
  addCommands() {
    return {
      insertMedTag: (options) => ({ commands }) => {
        return commands.insertContent([{ type: this.name, attrs: options }, { type: 'text', text: ' ' }])
      },
    }
  },
})

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  parseHTML: () => [{ tag: 'div[data-type="page-break"]' }],
  renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page-break', class: 'page-break-indicator' })],
  addCommands() {
    return {
      setPageBreak: () => ({ chain }) => chain().insertContent({ type: this.name }).focus().run(),
    }
  },
})

export const Spoiler = Node.create({
  name: 'spoiler',
  group: 'inline',
  inline: true,
  content: 'text*',
  parseHTML: () => [{ tag: 'span[data-type="spoiler"]' }],
  renderHTML: ({ HTMLAttributes }) => [
    'span', 
    mergeAttributes(HTMLAttributes, { 
      'data-type': 'spoiler', 
      class: 'spoiler-content',
      // We use a CSS-only approach or a simple click handler toggle
      onclick: 'this.classList.toggle("is-visible")' 
    }), 
    0
  ],
  addCommands() {
    return {
      toggleSpoiler: () => ({ commands }) => commands.toggleWrap(this.name),
    }
  },
})