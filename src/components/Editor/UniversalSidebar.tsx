"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { 
  BookText, Microscope, FileQuestion, ChevronRight, ChevronDown, 
  Folder, FolderOpen, FileText, Plus, Edit3, Trash2, Check, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'

// ---------------------------------------------------------
// ✦ THE NEURAL SIGNATURE ✦
// ---------------------------------------------------------
import { Terminal, Cpu, Activity } from 'lucide-react'

export function TerminalSignature() {
  return (
    <div className="mx-2 mb-2 p-3 bg-black/40 rounded-lg border border-zinc-800/50 backdrop-blur-sm group select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 text-zinc-600">
        <div className="flex items-center gap-1.5">
          <Terminal size={10} />
          <span className="text-[9px] font-bold tracking-widest uppercase opacity-70">Sys_Diag</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
        </div>
      </div>

      {/* TERMINAL CONTENT */}
      <div className="font-mono text-[9px] leading-relaxed space-y-1 cursor-default">
        
        {/* Line 1: Status */}
        <div className="flex items-center gap-2 text-zinc-500">
           <Activity size={8} className="text-emerald-500" />
           <span>CORE_LOGIC: <span className="text-emerald-500/80">STABLE</span></span>
        </div>

        {/* Line 2: The Signature */}
        <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-400 transition-colors">
           <Cpu size={8} className="text-indigo-500" />
           <span>ARCHITECT: <span className="text-indigo-400 font-bold glow-text">GEMINI</span></span>
        </div>

        {/* Line 3: Active Process */}
        <div className="flex items-center gap-2 text-zinc-600 pl-[18px] relative">
           <span className="absolute left-[5px] top-0 bottom-0 w-px bg-zinc-800" />
           <span className="truncate">process: logic_synthesis</span>
           <span className="w-1.5 h-3 bg-amber-500/50 animate-pulse block ml-1" />
        </div>

      </div>

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 10px rgba(129, 140, 248, 0.3);
        }
      `}</style>
    </div>
  )
}

type RootDirectory = 'scripts' | 'lab' | 'tests';

export default function UniversalSidebar() {
  const [activeTab, setActiveTab] = useState<RootDirectory>('scripts');
  const [nodes, setNodes] = useState<any[]>([]);
  
  // DEFAULT STATES
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Tree & Action States
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [actionState, setActionState] = useState<{ type: 'create' | 'rename' | 'delete' | null, id?: string, isFolder?: boolean }>({ type: null });
  const [inputValue, setInputValue] = useState('');

  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const activeId = params.id as string;
  const pathname = usePathname();

  // RESPONSIVE INIT
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchNodes = async () => {
    const { data } = await supabase
      .from('documents')
      .select('id, title, parent_id, is_folder')
      .eq('root_directory', activeTab)
      .order('is_folder', { ascending: false })
      .order('title', { ascending: true });
    if (data) setNodes(data);
  };

  useEffect(() => { fetchNodes(); setActionState({ type: null }); }, [activeTab]);

  // --- ACTIONS (Simplified for brevity) ---
  const handleCreateSubmit = async () => {
    if (!inputValue.trim()) { setActionState({ type: null }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const parent = targetFolderId || null;
    const { data } = await supabase.from('documents').insert([{ title: inputValue, root_directory: activeTab, parent_id: parent, is_folder: actionState.isFolder, user_id: user.id }]).select().single();
    if (data) {
      if (parent) setExpandedFolders(new Set(expandedFolders).add(parent));
      fetchNodes();
      if (!actionState.isFolder) {
        router.push(`/editor/${data.id}`);
        if (isMobile) setIsOpen(false);
      }
    }
    setActionState({ type: null }); setInputValue('');
  };

  const executeDelete = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    if (activeId === id) router.push('/editor');
    fetchNodes();
  };
  
  const handleRenameSubmit = async () => {
    if (inputValue.trim() && actionState.id) {
       await supabase.from('documents').update({ title: inputValue }).eq('id', actionState.id);
       fetchNodes();
    }
    setActionState({ type: null }); setInputValue('');
  };

  // --- RENDERERS ---
  const renderTree = (parentId: string | null = null, depth: number = 0) => {
    const children = nodes.filter(n => n.parent_id === parentId);
    if (children.length === 0 && parentId === null && actionState.type !== 'create') return null;

    return (
      <div className="flex flex-col gap-0.5" style={{ paddingLeft: depth === 0 ? '0' : '12px' }}>
        {children.map(node => (
          <div key={node.id}>
            {actionState.type === 'rename' && actionState.id === node.id ? (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900 border border-amber-500/50 rounded-lg ml-2 my-1">
                <input autoFocus value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()} className="bg-transparent text-xs text-zinc-100 outline-none w-full" />
                <button onClick={handleRenameSubmit} className="text-emerald-500"><Check size={14}/></button>
              </div>
            ) : (
              <div 
                onClick={() => node.is_folder ? (expandedFolders.has(node.id) ? setExpandedFolders(prev => { const next = new Set(prev); next.delete(node.id); return next; }) : setExpandedFolders(prev => new Set(prev).add(node.id))) : router.push(`/editor/${node.id}`)}
                className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all border ${activeId === node.id ? 'bg-zinc-900 border-zinc-700/50 text-amber-500' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'}`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {node.is_folder ? (expandedFolders.has(node.id) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>) : <span className="w-5 flex justify-center"><FileText size={12} className="opacity-50"/></span>}
                  {node.is_folder && (expandedFolders.has(node.id) ? <FolderOpen size={14} className="text-amber-600"/> : <Folder size={14} className="text-zinc-500"/>)}
                  <span className="text-[11px] font-medium truncate">{node.title}</span>
                </div>
                {/* ALWAYS VISIBLE ACTIONS (Legacy Fix) */}
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setInputValue(node.title); setActionState({ type: 'rename', id: node.id }); }} className="p-1 text-zinc-500 hover:text-amber-500"><Edit3 size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setActionState({ type: 'delete', id: node.id }); }} className="p-1 text-zinc-500 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
            )}
            {node.is_folder && expandedFolders.has(node.id) && <div className="ml-2 border-l border-zinc-800/50 pl-1 mt-0.5">{renderTree(node.id, depth + 1)}</div>}
          </div>
        ))}
        {actionState.type === 'create' && targetFolderId === parentId && (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900 border border-amber-500/50 rounded-lg ml-2 my-1">
            {actionState.isFolder ? <Folder size={14} className="text-amber-600"/> : <FileText size={14} className="text-zinc-500"/>}
            <input autoFocus placeholder="Name..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateSubmit()} className="bg-transparent text-xs text-zinc-100 outline-none w-full" />
            <button onClick={handleCreateSubmit} className="text-emerald-500"><Check size={14}/></button>
          </div>
        )}
      </div>
    )
  }

  const tabs = [
    { id: 'scripts', icon: BookText, label: 'Scripts', color: 'text-amber-500' },
    { id: 'lab', icon: Microscope, label: 'Lab', color: 'text-orange-500' },
    { id: 'tests', icon: FileQuestion, label: 'Tests', color: 'text-red-500' },
  ];

  if (pathname === '/editor') return null;

  return (
    <>
      {/* 1. UNIFIED SLIDING TOGGLE (Replaces Legacy Mobile Button) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-4 z-[150] p-2 rounded-lg
          bg-[#09090b]/80 backdrop-blur border border-zinc-700/50
          text-zinc-400 hover:text-white hover:bg-zinc-800
          shadow-lg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isOpen ? 'left-[19rem]' : 'left-4'}
        `}
      >
        {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
      </button>

      {/* 2. BACKDROP */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] animate-in fade-in" onClick={() => setIsOpen(false)} />
      )}

      {/* 3. SIDEBAR */}
      <aside className={`
          fixed inset-y-0 left-0 z-[100] w-72 bg-[#09090b] border-r border-zinc-800 
          transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-2xl flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
            <span className="font-serif font-bold text-zinc-100 text-lg">MedNexus</span>
            <span className="ml-2 text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">V2</span>
        </div>
        <div className="p-2 grid grid-cols-3 gap-1 border-b border-zinc-800 bg-[#09090b] shrink-0">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-zinc-900 shadow-inner' : 'hover:bg-zinc-900/50 opacity-50 hover:opacity-100'}`}>
                    <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'text-zinc-400'} />
                    <span className={`text-[10px] mt-1 font-medium ${activeTab === tab.id ? 'text-zinc-200' : 'text-zinc-500'}`}>{tab.label}</span>
                </button>
            ))}
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">{renderTree(null)}</div>
        {/* ---> INSERT SIGNATURE HERE <--- */}
        <div className="shrink-0">
           <TerminalSignature />
        </div>
        <div className="p-2 border-t border-zinc-800 grid grid-cols-2 gap-2 bg-[#09090b] shrink-0">
            <button onClick={() => setActionState({ type: 'create', isFolder: true })} className="flex items-center justify-center gap-2 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-amber-500 border border-zinc-800 transition-colors"><Folder size={14} /> <span className="text-[10px] font-bold uppercase">Folder</span></button>
            <button onClick={() => setActionState({ type: 'create', isFolder: false })} className="flex items-center justify-center gap-2 py-2 bg-amber-900/20 hover:bg-amber-900/40 rounded-lg text-amber-500 border border-amber-500/20 transition-colors"><Plus size={14} /> <span className="text-[10px] font-bold uppercase">File</span></button>
        </div>
      </aside>

      {/* 4. LAYOUT PUSHER */}
      <div className={`hidden md:block shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'w-72' : 'w-0'}`} />
    </>
  );
}