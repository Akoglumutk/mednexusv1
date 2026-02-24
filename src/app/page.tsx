import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookText, PenTool, Smartphone, Cpu, Settings, LogOut, User, Home, Book, Pen, PenLine, Phone, CircuitBoard, LucideCircuitBoard, Sparkle, Sparkles } from 'lucide-react'
import { QuickUpdate } from '@/components/QuickUpdate'
import { CountdownCard } from '@/components/Dashboard/CountdownCard'
import { ScheduleCard } from '@/components/Dashboard/ScheduleCard'
import { AcademicBar } from '@/components/Dashboard/AcademicBar'
import { SignOutButton } from '@/components/Auth/SignOutButton' // We'll create this small helper

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login'); // Removed admin check for now to let you test

  const [
    { data: settings },
    { count: noteCount },
    { count: canvasCount },
    { count: coreCount }
  ] = await Promise.all([
    supabase.from('settings').select('*').single(),
    supabase.from('notes').select('*', { count: 'exact', head: true }),
    supabase.from('canvases').select('*', { count: 'exact', head: true }), 
    supabase.from('exams').select('*', { count: 'exact', head: true })      
  ]);

  const modules = [
    { 
      name: 'The Editor', 
      desc: 'Deep Work & Synthesis (PC)', 
      icon: BookText, 
      color: 'border-amber-700/40 text-amber-500', 
      gradient: 'from-amber-950/30 to-zinc-900/50',
      href: '/editor', 
      count: noteCount || 0
    },
    { 
      name: 'The Canvas', 
      desc: 'Infinite Ideation (Tablet)', 
      icon: PenTool, 
      color: 'border-orange-700/40 text-orange-500', 
      gradient: 'from-orange-950/30 to-zinc-900/50',
      href: '/canvas', 
      count: canvasCount || 0
    },
    { 
      name: 'The Core', 
      desc: 'Active Recall (Phone)', 
      icon: Smartphone, 
      color: 'border-red-700/40 text-red-500', 
      gradient: 'from-red-950/30 to-zinc-900/50',
      href: '/core', 
      count: coreCount || 0
    },
    { 
      name: 'The Oracle', 
      desc: 'Artificial Intellect', 
      icon: Cpu, 
      color: 'border-purple-700/40 text-purple-400', 
      gradient: 'from-purple-950/30 to-zinc-900/50',
      href: '/oracle', 
      count: 'AI' 
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-amber-900/50 pb-32 relative">
      
      {/* 1. ACADEMIC HUD (Sticky Top) */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-800/80 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <AcademicBar 
                term={settings?.current_term || 'Term Unknown'} 
                settingsId={settings?.id} 
                nextExamDate={settings?.exam_date} 
                nextExamName={settings?.exam_name}
            />
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 mt-4">
        
        {/* 2. WIDGET GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-full">
            <CountdownCard initialData={settings} />
          </div>
          <div className="lg:col-span-8 h-full">
            <ScheduleCard initialSchedule={settings?.today_schedule || []} />
          </div>
        </section>

        {/* 3. MODULES (The Trinity) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <Link href={mod.href} key={mod.name} className="group block outline-none">
                <div className={`
                    relative h-full p-6 rounded-3xl border transition-all duration-300
                    bg-gradient-to-br ${mod.gradient} ${mod.color}
                    hover:border-opacity-100 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]
                    active:scale-[0.98]
                `}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl border bg-black/40 backdrop-blur-sm shadow-inner ${mod.color}`}>
                        <mod.icon size={28} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-zinc-100 font-serif tracking-tight group-hover:text-white transition-colors">
                          {mod.name}
                        </h3>
                        <p className="text-xs font-mono uppercase tracking-wider opacity-60 mt-1">
                          {mod.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </section>

      </div>

      {/* 4. THE SYSTEM DOCK (Replaces Global Navbar) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 p-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl">
            
            <Link href="/" className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all tooltip" title="Profile">
                <Home size={20} />
            </Link>
            <Link href="/editor" className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all tooltip" title="Profile">
                <BookText size={20} />
            </Link>
            <Link href="/canvas" className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all tooltip" title="Profile">
                <PenTool size={20} />
            </Link>
            <Link href="/oracle" className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all tooltip" title="Profile">
                <Cpu size={20} />
            </Link>
            <Link href="/heritage" className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all tooltip" title="Profile">
                <Sparkles size={20} />
            </Link>


            <div className="w-[1px] h-6 bg-zinc-700 mx-1" />

            <SignOutButton />
            
        </div>
      </div>

    </main>
  )
}
