"use client"
import { useState } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'

export function OracleModal({ isOpen, onClose, onInject }: any) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConsult = async () => {
    setLoading(true)
    const res = await fetch('/api/oracle', {
      method: 'POST',
      body: JSON.stringify({ rawText: input })
    })
    const data = await res.json()
    onInject(data.html)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-amber-900/30 w-full max-w-2xl rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-amber-500 font-mono font-bold flex items-center gap-2">
            <Sparkles size={18} /> CONSULT THE ORACLE
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20}/></button>
        </div>
        <textarea 
          className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-300 outline-none focus:border-amber-700 transition-all font-mono text-sm"
          placeholder="Paste raw lecture data here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          onClick={handleConsult}
          disabled={loading}
          className="w-full mt-4 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'STRUCTURE KNOWLEDGE'}
        </button>
      </div>
    </div>
  )
}