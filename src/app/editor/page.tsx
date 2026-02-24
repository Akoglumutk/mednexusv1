// ./src/app/editor/page.tsx
"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { 
  BookText, Microscope, FileQuestion, ChevronRight, ChevronDown, 
  Folder, FolderOpen, FileText, Plus, Edit3, Trash2, Check, X,
  Search, Clock, LayoutGrid, List as ListIcon
} from 'lucide-react'

type RootDirectory = 'scripts' | 'lab' | 'tests';

export default function EditorDashboard() {
  const [activeTab, setActiveTab] = useState<RootDirectory>('scripts');
  const [nodes, setNodes] = useState<any[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [actionState, setActionState] = useState<{ type: 'create' | 'rename' | 'delete' | null, id?: string, isFolder?: boolean }>({ type: null });
  const [inputValue, setInputValue] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  const fetchNodes = async () => {
    const { data } = await supabase
      .from('documents')
      .select('id, title, parent_id, is_folder, updated_at')
      .eq('root_directory', activeTab)
      .order('is_folder', { ascending: false })
      .order('title', { ascending: true });
      
    if (data) setNodes(data);
  };

  useEffect(() => {
    fetchNodes();
    setTargetFolderId(null);
    setActionState({ type: null });
  }, [activeTab]);

  // --- ACTIONS (Mirrored from your Sidebar Logic) ---
  const handleCreateSubmit = async () => {
    if (!inputValue.trim()) { setActionState({ type: null }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const safeParentId = targetFolderId ? targetFolderId : null;

    const { data } = await supabase.from('documents').insert([{ 
      title: inputValue, root_directory: activeTab, parent_id: safeParentId, is_folder: actionState.isFolder, user_id: user.id
    }]).select().single();

    if (data) {
      if (safeParentId) {
        const newExpanded = new Set(expandedFolders);
        newExpanded.add(safeParentId);
        setExpandedFolders(newExpanded);
      }
      fetchNodes();
      if (!actionState.isFolder) router.push(`/editor/${data.id}`);
    }
    setActionState({ type: null }); setInputValue('');
  };

  const handleRenameSubmit = async () => {
    if (!inputValue.trim() || !actionState.id) { setActionState({ type: null }); return; }
    await supabase.from('documents').update({ title: inputValue }).eq('id', actionState.id);
    fetchNodes(); setActionState({ type: null }); setInputValue('');
  };

  const executeDelete = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    fetchNodes(); setActionState({ type: null });
  };

  const toggleFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedFolders(newExpanded); 
    setTargetFolderId(id);
  };

  // --- RENDERER (Cleaned up for full-page view) ---
  const renderTree = (parentId: string | null = null, depth: number = 0) => {
    const children = nodes.filter(n => n.parent_id === parentId);
    
    return (
      <div className="flex flex-col gap-1" style={{ paddingLeft: depth === 0 ? '0' : '24px' }}>
        {children.map(node => (
          <div key={node.id} className="w-full">
            {actionState.type === 'rename' && actionState.id === node.id ? (
              /* RENAME INPUT MODE */
              <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-amber-500/50 rounded-xl my-1">
                <input 
                  autoFocus 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()} 
                  className="bg-transparent text-sm text-zinc-100 outline-none w-full font-medium" 
                />
                <button onClick={handleRenameSubmit} className="text-emerald-500"><Check size={18}/></button>
              </div>
            ) : (
              /* NORMAL ROW MODE */
              <div 
                onClick={(e) => {
                  // Pass the real event 'e' to the toggle function
                  if (node.is_folder) toggleFolder(node.id, e);
                  else router.push(`/editor/${node.id}`);
                }}
                className={`group flex items-center justify-between px-3 py-4 rounded-xl cursor-pointer transition-all border ${
                  targetFolderId === node.id 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                    : 'border-transparent text-zinc-400 active:bg-zinc-900/80 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="shrink-0">
                    {node.is_folder ? (
                      <div className="p-1 text-zinc-500">
                        {expandedFolders.has(node.id) ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                      </div>
                    ) : <div className="w-7 flex justify-center"><FileText size={16} className="opacity-40"/></div>}
                  </div>
                  
                  {node.is_folder && (
                    expandedFolders.has(node.id) ? <FolderOpen size={20} className="text-amber-500 shrink-0"/> : <Folder size={20} className="text-zinc-500 shrink-0"/>
                  )}

                  <span className="text-sm font-medium truncate pr-2">{node.title}</span>
                </div>
                
                {/* MOBILE OPTIMIZED ACTIONS: Visible by default, slightly larger hit area */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); // Stop from opening the file/folder
                        setInputValue(node.title); 
                        setActionState({ type: 'rename', id: node.id }); 
                      }} 
                      className="p-2.5 text-zinc-500 hover:text-amber-500 active:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); // Stop from opening the file/folder
                        if(confirm('Delete permanently?')) executeDelete(node.id); 
                      }} 
                      className="p-2.5 text-zinc-500 hover:text-red-500 active:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                </div>
              </div>
            )}

            {node.is_folder && expandedFolders.has(node.id) && (
              <div className="ml-4 border-l border-zinc-800/80 mt-1 mb-2">
                {renderTree(node.id, depth + 1)}
              </div>
            )}
          </div>
        ))}
        
        {actionState.type === 'create' && targetFolderId === parentId && (
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-amber-500/50 rounded-xl my-1 ml-6">
            {actionState.isFolder ? <Folder size={18} className="text-amber-500"/> : <FileText size={18} className="text-zinc-500"/>}
            <input autoFocus placeholder="Name your item..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateSubmit()} className="bg-transparent text-sm text-zinc-100 outline-none w-full" />
            <button onClick={handleCreateSubmit} className="text-emerald-500"><Check size={18}/></button>
            <button onClick={() => setActionState({type: null})} className="text-zinc-500"><X size={18}/></button>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'scripts', icon: BookText, label: 'Scripts', color: 'amber' },
    { id: 'lab', icon: Microscope, label: 'Lab', color: 'orange' },
    { id: 'tests', icon: FileQuestion, label: 'Tests', color: 'red' },
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
      {/* 1. TOP NAV / HEADER */}
      <div className="h-20 border-b border-zinc-900 flex items-center justify-between px-8 bg-[#070708]">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-serif font-bold text-zinc-100 tracking-tight">Workspace</h1>
          <nav className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-zinc-900 text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => { setTargetFolderId(null); setActionState({ type: 'create', isFolder: true }); }} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 rounded-lg border border-zinc-800">
            <Plus size={14} /> NEW FOLDER
          </button>
          <button onClick={() => { setTargetFolderId(null); setActionState({ type: 'create', isFolder: false }); }} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 transition-colors rounded-lg">
            <Plus size={14} /> NEW PROTOCOL
          </button>
        </div>
      </div>

      {/* 2. MAIN EXPLORER AREA */}
      <div className="flex-1 overflow-y-auto p-8 max-w-5xl w-full mx-auto custom-scrollbar">
         {/* Tree Section */}
         <div className="bg-zinc-900/10 border border-zinc-900/50 rounded-3xl p-6 min-h-[60vh]">
            {renderTree(null)}
            {nodes.filter(n => n.parent_id === null).length === 0 && actionState.type !== 'create' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                   <Folder size={24} className="text-zinc-700" />
                </div>
                <h3 className="text-zinc-300 font-medium">No documents in this sector</h3>
                <p className="text-zinc-600 text-sm mt-1">Start by creating a folder or a new file above.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}