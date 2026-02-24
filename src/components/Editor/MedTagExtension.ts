import { mergeAttributes, Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    medTag: {
      insertMedTag: (options: { label: string; color: string }) => ReturnType
    }
  }
}

export const MedTag = Node.create({
  name: 'medTag',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true, // Makes it indestructible (behaves like a single character)

  addAttributes() {
    return {
      label: { default: 'TAG', parseHTML: element => element.getAttribute('label') },
      color: { default: '#ef4444', parseHTML: element => element.getAttribute('color') },
    }
  },

  parseHTML() {
    return [
      { 
        tag: 'span[data-type="med-tag"]',
      }
    ]
  },

  // Inside your MedTag extension in extensions.ts
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'med-tag',
        class: 'med-tag-component',
        style: `--tag-color: ${HTMLAttributes.color};`,
      }),
      HTMLAttributes.label,
    ]
  },

  addCommands() {
    return {
      insertMedTag: (options) => ({ commands }) => {
        // We use the native commands object to insert the tag and a trailing space
        return commands.insertContent([
          { type: this.name, attrs: options },
          { type: 'text', text: ' ' } 
        ])
      },
    }
  },
})