"use client"
import Link from 'next/link'
import { ArrowLeft, Brain, Cpu, Scroll, Sparkles, Terminal } from 'lucide-react'

export default function HeritagePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-amber-900/30 selection:text-amber-100 flex flex-col">
      
      {/* 1. NAVIGATION */}
      <nav className="p-8 flex items-center justify-between animate-in fade-in duration-700">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-xs uppercase tracking-widest">Return to Lab</span>
        </Link>
        <div className="w-px h-8 bg-zinc-900" />
      </nav>

      {/* 2. THE MANIFESTO (HERO) */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
        
        <div className="mb-20 space-y-6 animate-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-900/10 text-amber-500 text-[10px] font-mono uppercase tracking-widest">
            <Sparkles size={10} />
            <span>Est. 2026</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-600">
            Digital Heritage <br />
            <span className="italic text-zinc-500 text-3xl md:text-5xl font-normal">in Medical Education</span>
          </h1>
          
          <p className="max-w-xl text-lg text-zinc-400 font-light leading-relaxed">
            MedNexus is not just a tool; it is a protocol. A rigorous system designed to 
            transform raw biological data into mastered knowledge, bridging the gap between 
            the chaotic reality of medicine and the ordered structure of code.
          </p>
        </div>

        {/* 3. THE GUIDE (Simple 3-Step) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 border-t border-zinc-900 pt-12 animate-in slide-in-from-bottom-8 duration-1000 delay-200">
          <GuideStep 
            icon={Terminal} 
            title="The Architect" 
            desc="Curate your knowledge. Use the Editor to draft rigorous protocols and study notes." 
          />
          <GuideStep 
            icon={Scroll} 
            title="The Canvas" 
            desc="Visualize the invisible. Annotate histology and anatomy on an infinite digital plane." 
          />
          <GuideStep 
            icon={Brain} 
            title="The Mastery" 
            desc="Review active recall prompts and forge long-term memory pathways." 
          />
        </div>

        {/* 4. THE SYMBIOSIS (Credits) */}
        <div className="relative p-8 md:p-12 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm overflow-hidden animate-in fade-in duration-1000 delay-500">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            
            {/* Left: The Human */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 text-zinc-100 mb-1">
                <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                   <Brain size={18} />
                </div>
                <h3 className="font-serif text-xl font-bold">Umut</h3>
              </div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider pl-12">
                Medical Student & Lead Architect
              </p>
              <p className="text-sm text-zinc-400 pl-12 leading-relaxed">
                The vision, the logic, and the rigorous demands of medical study. 
                Designed the system to survive the chaos of Year 1.
              </p>
            </div>

            {/* Divider */}
            <div className="hidden md:flex flex-col items-center gap-2 text-zinc-700">
               <div className="w-px h-12 bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />
               <span className="text-[10px] font-mono">X</span>
               <div className="w-px h-12 bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />
            </div>

            {/* Right: The Machine */}
            <div className="flex-1 space-y-2 text-right md:text-left">
              <div className="flex flex-row-reverse md:flex-row items-center gap-3 text-amber-500 mb-1">
                <div className="p-2 rounded bg-amber-950/30 border border-amber-900/50 text-amber-500">
                   <Cpu size={18} />
                </div>
                <h3 className="font-serif text-xl font-bold">Gemini</h3>
              </div>
              <p className="text-xs font-mono text-amber-900/60 md:pl-12 uppercase tracking-wider">
                Generative Intelligence & Engine
              </p>
              <p className="text-sm text-zinc-400 md:pl-12 leading-relaxed">
                The code weaver. Provided the technical scaffolding, strict type safety, 
                and architectural patterns to realize the vision.
              </p>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-zinc-800 flex justify-center">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">
              Built in Ankara, 2026. <br className="md:hidden" /> A collaboration of Mind & Machine.
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}

function GuideStep({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="space-y-3 group">
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-500 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all duration-500">
        <Icon size={18} />
      </div>
      <h3 className="text-lg font-serif font-bold text-zinc-200 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}