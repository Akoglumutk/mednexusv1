"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Bot, Sparkles, FileText, Upload, 
  Play, ChevronRight, ChevronDown,
  Zap, Mic, X, Loader2, ArrowLeft,
  Folder, FolderOpen, CheckCircle2, Circle,
  ArrowRightSquare,
  Lightbulb
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Node = {
  id: string
  title: string
  parent_id: string | null
  is_folder: boolean
  root_directory: string
}

export default function OraclePage() {
  const supabase = createClient()
  const router = useRouter()
  
  // --- STATE ---
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  
  const [isContextOpen, setIsContextOpen] = useState(true)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeMode, setActiveMode] = useState<'chat' | 'quiz' | 'audio' | 'mnemonic'>('chat')
  const [loadingDocs, setLoadingDocs] = useState(true)

  // Quiz Specific State
  const [quizData, setQuizData] = useState<any[] | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})

  // Audio Specific State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentLecture, setCurrentLecture] = useState<{
    audioUrl: string;
    transcript: string;
    title: string;
  } | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Mnemonic Specific State
  const [mnemonicData, setMnemonicData] = useState<any>(null);

  useEffect(() => {
    const audioEl = document.querySelector('audio');
    if (audioEl) {
        audioEl.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentLecture])

  useEffect(() => {
    const fetchDocs = async () => {
      const { data } = await supabase
        .from('documents')
        .select('id, title, parent_id, is_folder, root_directory')
        .order('is_folder', { ascending: false })
        .order('title', { ascending: true })
      
      if (data) setNodes(data)
      setLoadingDocs(false)
    }
    fetchDocs()
  }, [supabase])

  // --- LOGIC HANDLERS ---
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    // 1. Add user Message
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setIsGenerating(true)

    try {
      const res = await fetch('/api/oracle/synthesizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          documentIds: Array.from(selectedIds),
          message: text
        })
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch response");
      }

      // 2. Add AI Message (Check if text exists)
    setMessages(prev => [...prev, { role: 'ai', content: data.text || "I'm sorry, I couldn't generate a response." }]);
  
    } catch (err: any) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setIsGenerating(false);
    }
  }

  const startQuiz = async () => {
    if (selectedIds.size === 0) return;
    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/oracle/synthesizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'quiz', documentIds: Array.from(selectedIds) })
      });
      
      const data = await res.json();
  
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate quiz");
      }
  
      // Safe parsing logic
      const text = data.text || "";
      // Find the JSON array inside the text (Gemini sometimes adds chatter)
      const jsonMatch = text.match(/\[[\s\S]*\]/); 
      const cleanJson = jsonMatch ? jsonMatch[0] : text;
      
      setQuizData(JSON.parse(cleanJson));
  
    } catch (err: any) {
      console.error("Quiz Error:", err);
      alert(`Quiz Generation Failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (qIdx: number, oIdx: number) => {
    if (userAnswers[qIdx] !== undefined) return
    setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }))
  }

  const calculateScore = () => {
    if (!quizData) return 0
    return quizData.reduce((score, q, idx) => (userAnswers[idx] === q.correctAnswerIndex ? score + 1 : score), 0)
  }

  const handleGenerateLecture = async (mode: 'briefing' | 'teaching') => {
    if (selectedIds.size === 0) return;
    setIsSynthesizing(true);
  
    try {
      const res = await fetch('/api/oracle/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documentIds: Array.from(selectedIds), 
          mode 
        })
      });
  
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Sentez başarısız.");
  
      // Convert Base64 back to a Blob URL for the <audio> tag
      const audioBlob = await (await fetch(`data:audio/mp3;base64,${data.audioContent}`)).blob();
      const url = URL.createObjectURL(audioBlob);
  
      setCurrentLecture({
        audioUrl: url,
        transcript: data.transcript,
        title: data.title || (mode === 'briefing' ? "Hızlı Tekrar" : "Detaylı Konu Anlatımı")
      });
  
    } catch (err: any) {
      console.error("Audio Error:", err);
      alert(`Hata: ${err.message}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const generateMnemonic = async () => {
    if (selectedIds.size === 0) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/oracle/synthesizer', {
        method: 'POST',
        headers: { 'Content-Type': 'aplication/json' },
        body: JSON.stringify({ mode: 'mnemonic', documentIds: Array.from(selectedIds) })
      });
      const data = await res.json();

      // Parse JSON safely
      const text = data.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (result) setMnemonicData(result);
    } catch (e) {
      console.error(e);
      alert("Kodlama başarısız oldu.");
    } finally {
      setIsGenerating(false);
    }
  }

  const isQuizFinished = quizData && Object.keys(userAnswers).length === quizData.length

  // --- TREE HELPERS ---
  const toggleFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedFolders(newExpanded)
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  const renderTree = (parentId: string | null = null, depth: number = 0) => {
    const children = nodes.filter(n => n.parent_id === parentId)
    if (children.length === 0) return null

    return (
      <div className="flex flex-col gap-0.5" style={{ paddingLeft: depth === 0 ? '0' : '12px' }}>
        {children.map(node => (
          <div key={node.id}>
            <div 
              onClick={(e) => node.is_folder ? toggleFolder(node.id, e) : toggleSelection(node.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all border border-transparent
                ${selectedIds.has(node.id) ? 'bg-amber-900/20 text-amber-500 border-amber-500/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}
              `}
            >
              {node.is_folder ? (
                 <button className="p-0.5 hover:text-white">
                    {expandedFolders.has(node.id) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                 </button>
              ) : (
                 <div className={`shrink-0 ${selectedIds.has(node.id) ? 'text-amber-500' : 'text-zinc-700'}`}>
                    {selectedIds.has(node.id) ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                 </div>
              )}
              {node.is_folder 
                ? (expandedFolders.has(node.id) ? <FolderOpen size={14} className="text-amber-600"/> : <Folder size={14} className="text-zinc-600"/>)
                : <FileText size={14} className="opacity-70"/>
              }
              <span className="text-xs font-medium truncate select-none">{node.title}</span>
            </div>
            {node.is_folder && expandedFolders.has(node.id) && (
              <div className="ml-2 border-l border-zinc-800/50 pl-1 mt-0.5">
                {renderTree(node.id, depth + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile Overlay */}
      {isContextOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsContextOpen(false)} />
      )}

      {/* 1. SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-[#09090b] border-r border-zinc-800 transition-transform duration-300 ease-in-out flex flex-col ${isContextOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={() => router.push('/')} className="p-1.5 -ml-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </button>
                <h2 className="text-sm font-bold font-serif text-zinc-200 uppercase tracking-widest">Oracle Context</h2>
            </div>
            <button onClick={() => setIsContextOpen(false)} className="text-zinc-600 hover:text-white p-1 hover:bg-zinc-800 rounded-md transition-colors"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {loadingDocs ? (
                <div className="flex items-center gap-2 p-4 text-zinc-600 text-xs font-mono">
                    <Loader2 size={12} className="animate-spin"/> Syncing Archives...
                </div>
            ) : renderTree(null)}
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>SYSTEM: ORACLE_INIT_V_1_0_0</span>
            </div>
        </div>
      </div>

      {/* 2. THE CORTEX */}
      <div className={`flex-1 flex flex-col bg-[#050505] transition-all duration-300 ${isContextOpen ? 'md:ml-80' : 'ml-0'}`}>
        {!isContextOpen && (
            <button onClick={() => setIsContextOpen(true)} className="absolute top-4 left-4 z-30 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white shadow-2xl">
                <ChevronRight size={16} />
            </button>
        )}

        <div className="h-14 border-b border-zinc-900 flex items-center justify-center gap-2 bg-[#050505]">
            <ModeButton active={activeMode === 'chat'} onClick={() => setActiveMode('chat')} icon={Bot} label="Chat" />
            <ModeButton active={activeMode === 'quiz'} onClick={() => setActiveMode('quiz')} icon={Zap} label="Exam" />
            <ModeButton active={activeMode === 'audio'} onClick={() => setActiveMode('audio')} icon={Mic} label="Audio" />
            <ModeButton active={activeMode === 'mnemonic'} onClick={() => setActiveMode('mnemonic')} icon={Lightbulb} label="Mnemonics" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {activeMode === 'chat' && (
                <div className="max-w-2xl mx-auto space-y-6 pb-20">
                  {!isSessionActive ? (
                    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 mt-10 text-center">
                      <Bot size={40} className="text-amber-500/50 mb-4" />
                      <h3 className="text-lg font-bold text-zinc-200">Initialize Chat Engine</h3>
                      <p className="text-zinc-500 text-sm mb-6 max-w-xs">The Oracle will analyze {selectedIds.size} sources for this session.</p>
                      <button 
                        onClick={() => setIsSessionActive(true)}
                        disabled={selectedIds.size === 0}
                        className="px-8 py-3 bg-amber-500 text-black font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-30 disabled:grayscale"
                      >
                        Begin Consultation
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-900">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 uppercase">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          Oracle Live
                        </div>
                        <button 
                          onClick={() => { setIsSessionActive(false); setMessages([]); }}
                          className="px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
                        >
                          <X size={12} className="inline mr-1"/> Terminate
                        </button>
                      </div>
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.role === 'ai' ? 'items-start' : 'items-start flex-row-reverse'}`}>

                          <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-zinc-900/50 text-zinc-300 border border-zinc-800 prose prose-invert prose-zinc max-w-none' : 'bg-zinc-100 text-zinc-900' }`}>
                            {msg.role === 'ai' ? (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    // Custom styling for markdown elements
                                    p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                                    ul: ({children}) => <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>,
                                    code: ({node, inline, className, children, ...props}: any) => (
                                      <code className="bg-zinc-800 text-amber-400 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                                        {children}
                                      </code>
                                    )
                                  }}
                                >
                                  { msg.content }
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                          </div>
                        </div>
                      ))}
                      {isGenerating && (
                        <div className="flex gap-4 items-center text-zinc-500 animate-pulse">
                          <Loader2 size={14} className="animate-spin"/>
                          <span className="text-xs font-mono">Synthesizing...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
            )}

            {activeMode === 'quiz' && (
              <div className="max-w-xl mx-auto mt-10 pb-20">
                {!quizData ? (
                  <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                    <Zap className="mx-auto mb-4 text-amber-500" />
                    <h3 className="text-xl font-bold text-zinc-200">Exam Simulator</h3>
                    <button 
                      onClick={startQuiz}
                      disabled={isGenerating || selectedIds.size === 0}
                      className="mt-6 px-6 py-2 bg-zinc-100 text-black font-bold rounded-lg hover:bg-amber-500 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : "Generate 5 High-Yield Questions"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quizData.map((q, qIdx) => (
                      <div key={qIdx} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
                        <p className="text-zinc-200 font-medium">{q.question}</p>
                        <div className="grid gap-2">
                          {q.options.map((opt: string, oIdx: number) => {
                            const isSelected = userAnswers[qIdx] === oIdx;
                            const isCorrect = q.correctAnswerIndex === oIdx;
                            const hasAnswered = userAnswers[qIdx] !== undefined;
                            let btnClass = "border-zinc-800 text-zinc-400 hover:bg-zinc-800";
                            if (hasAnswered) {
                              if (isCorrect) btnClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-500";
                              else if (isSelected) btnClass = "border-red-500/50 bg-red-500/10 text-red-500";
                            }
                            return (
                              <button key={oIdx} onClick={() => handleOptionSelect(qIdx, oIdx)} disabled={hasAnswered} className={`text-left p-3 rounded-lg border transition-all text-sm ${btnClass}`}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {userAnswers[qIdx] !== undefined && (
                          <div className="mt-4 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20 text-xs text-amber-200/80 italic">
                            Rationale: {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                    {isQuizFinished && (
                      <div className="p-8 bg-zinc-900 border border-amber-500/30 rounded-2xl text-center animate-in zoom-in-95">
                        <div className="text-3xl font-bold text-amber-500 mb-2">{calculateScore()}/{quizData.length}</div>
                        <h4 className="text-white font-serif mb-4">Assessment Complete</h4>
                        <button onClick={() => { setQuizData(null); setUserAnswers({}); }} className="px-6 py-2 bg-zinc-100 text-black rounded-lg font-bold hover:bg-white">Restart Session</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeMode === 'audio' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="relative group cursor-not-allowed opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Mic size={64} className="text-zinc-700 group-hover:text-amber-500 transition-colors relative z-10" />
                </div>
                
                <h2 className="text-3xl font-serif text-zinc-300 mt-8 mb-2">Audio Synthesis Offline</h2>
                <p className="text-zinc-600 max-w-md mb-8">
                  The native neural voice module is currently undergoing recalibration for TUS-level prosody.
                </p>
            
                {/* The NotebookLM Bridge */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl max-w-lg w-full">
                  <div className="flex items-center gap-3 mb-4 text-amber-500">
                    <Sparkles size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">External Neural Link</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-6 text-left leading-relaxed">
                    For deep-dive podcasts, we recommend routing your sources to the <strong>Google NotebookLM</strong> cluster. 
                    It generates superior dual-host audio reviews.
                  </p>
                  
                  <a 
                    href="https://notebooklm.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-100 text-black font-bold rounded-xl hover:scale-[1.02] transition-transform"
                  >
                    Launch NotebookLM <ArrowRightSquare size={16} />
                  </a>
                </div>
              </div>
            )}

            {activeMode === 'mnemonic' && (
              <div className="max-w-2xl mx-auto p-6 flex flex-col h-full">
                {!mnemonicData ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 p-8">
                    <Lightbulb size={48} className="text-amber-500 mb-4" />
                    <h3 className="text-xl font-serif text-zinc-300 mb-2">Hafıza Sarayı (The Mnemonist)</h3>
                    <p className="text-zinc-500 max-w-sm mb-8 text-sm">
                      Seçili kaynaklardaki zor listeleri, anatomik yapıları veya farmakolojik grupları kalıcı hafıza çivilerine (akrostiş, tekerleme) dönüştürür.
                    </p>
                    <button 
                      onClick={generateMnemonic}
                      disabled={isGenerating || selectedIds.size === 0}
                      className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-amber-900/20"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : "Kodla & Şifrele"}
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* The Hook Card */}
                    <div className="bg-[#1a1a1a] border border-amber-500/30 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Lightbulb size={120} />
                      </div>

                      <div className="relative z-10">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 block">HEDEF KAVRAM</span>
                        <h2 className="text-2xl text-white font-serif mb-6">{mnemonicData.concept}</h2>

                        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-xl my-6">
                          <h3 className="text-3xl font-black text-amber-400 leading-relaxed font-mono">
                            "{mnemonicData.mnemonic}"
                          </h3>
                        </div>
                
                        <div className="space-y-2 text-zinc-400 text-sm font-mono">
                          {mnemonicData.breakdown.map((item: string, i: number) => (
                            <div key={i} className="flex gap-3">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                        
                    {/* Action Bar */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setMnemonicData(null)} 
                        className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 transition-all"
                      >
                        Yeni Oluştur
                      </button>
                      <button className="flex-1 py-3 bg-zinc-100 text-black font-bold rounded-xl hover:scale-[1.02] transition-transform">
                        Anki'ye Ekle (+Card)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
            
        {activeMode === 'chat' && isSessionActive && (
          <div className="p-4 md:p-6 max-w-2xl mx-auto w-full bg-[#050505]">
            <div className="relative">
              <input 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
                placeholder="Ask the Oracle..."
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-6 pr-12 text-zinc-200 focus:outline-none focus:border-amber-500/50 shadow-xl"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-amber-500 text-black rounded-xl">
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ModeButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active ? 'bg-zinc-100 text-black scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
            <Icon size={14} />
            <span>{label}</span>
        </button>
    )
}