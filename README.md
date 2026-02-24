# ⌬ HistoLab: The Neural Interface

> **"Structure is the mechanism of function."**

HistoLab is not just a note-taking app; it is a **Cognitive Scaffold** designed to bridge the gap between Medical Histology and Software Engineering. It transforms static biological data into an interactive, active-recall engine.

Built with **Next.js 14**, **Tiptap (Headless)**, and **Supabase**, it represents a "Heritage" architecture—robust, modular, and designed for the iPad-first experience of modern medical students.

---

## 🏗️ The Architecture

The application follows a **Headless-First** philosophy. We decouple the *State* (Database) from the *Interface* (Editor), allowing for "Surgical Precision" in how data is rendered.

### 1. The Core: `EditorEngine.tsx`
This is the central nervous system. It orchestrates:
- **State Management:** Uses a `debounce` pattern to sync with Supabase every 1.5s, preventing database thrashing while ensuring data integrity.
- **The Extension Layer:** A plugin-based system where features (Tables, Images, AI) are injected as independent modules.
- **The Oracle:** An integrated AI endpoint (`/api/oracle`) that acts as a "Scribe," cleaning raw notes into structured protocols.

### 2. The Skeleton: `UniversalSidebar.tsx`
A responsive, dual-state navigation system.
- **Desktop:** Acts as a "Push" panel, physically shifting the editor layout to preserve readability.
- **Mobile/iPad:** transforms into a glassmorphism overlay with touch-optimized targets.
- **Logic:** Features "Always-Visible" action buttons (Rename/Delete) to remove friction for touch users.

---

## 👁️ The Feature: Image Occlusion

The crown jewel of HistoLab. This tool solves the "Active Recall" problem for histology slides.

**Technical Implementation:**
- **Node View:** It is not a standard HTML image. It is a React Application mounted *inside* the text editor.
- **Coordinate System:** Uses **Percentage-Based Positioning (`%`)** instead of pixels.
    - *Why?* A box drawn on a 27-inch monitor will appear in the exact same relative position on an 11-inch iPad Air.
- **Touch Architecture:** - Uses `PointerEvents` instead of `MouseEvents` to support Apple Pencil and finger taps simultaneously.
    - Implements `touch-action: none` to prevent screen scrolling while drawing.

**Usage Guide:**
1.  **Insert:** Drag & Drop an image -> Click image -> Select "Study" (Eye Icon).
2.  **Edit Mode:**
    - **Square Tool:** Draw occlusion boxes.
    - **Arrow Tool:** Draw pointers (automatically rendered in High-Contrast Black).
    - **Text Tool:** Add labels that save on blur.
    - **Resize:** Drag the grip handle (bottom-right) to resize the canvas.
3.  **Study Mode:** Click "Study" to lock the canvas. Click boxes to reveal answers.

---

## 📂 Directory Structure (Heritage Edition)

```bash
src/
├── components/
│   ├── Editor/
│   │   ├── EditorEngine.tsx          # The Brain
│   │   ├── UniversalSidebar.tsx      # The Navigation
│   │   ├── suits/
│   │   │   ├── ImageOcclusionWrapper.tsx  # The Interactive Canvas
│   │   │   └── TerminalSignature.tsx      # The "Neural Uplink" Badge
│   │   └── extensions/
│   │       ├── ResizableImage.tsx    # Clean, standard image handler
│   │       └── ImageOcclusionExtension.ts # Tiptap Schema Definition
├── utils/
│   └── supabase/                     # Database Clients
└── app/
    └── editor/                       # Next.js App Router Pages