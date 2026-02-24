"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BookText, PenTool, Smartphone, Cpu, Timer, LogOut, Sparkles } from 'lucide-react';
import { useFocus } from '@/components/FocusContext';
import { createClient } from '@/utils/supabase/client';

export function NavigationShell() {
  const pathname = usePathname();
  const router = useRouter();
  const { isActive, formatTime, toggleTimer } = useFocus();
  const supabase = createClient();

  if (pathname === '/login') return null;

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/editor', icon: BookText, label: 'Editor' },
    { href: '/canvas', icon: PenTool, label: 'Canvas' },
    { href: '/core', icon: Smartphone, label: 'Core' },
    { href: '/oracle', icon: Cpu, label: 'Oracle' },
    { href: '/heritage', icon: Sparkles, label: 'Heritage' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isWorkMode = pathname.startsWith('/editor') || pathname.startsWith('/canvas')
  const positionClass = isWorkMode 
    ? 'top-4' 
    : 'bottom-6'

  return (
    <nav className={`fixed ${positionClass} left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 
      bg-[#09090b]/90 backdrop-blur-xl border border-zinc-800 
      rounded-2xl shadow-2xl shadow-black/50
      ${isWorkMode ? 'border-amber-900/20' : ''} `}
    >
      {navItems.map((item) => {
        const isActiveRoute = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="outline-none" title={item.label}>
            <div className={`p-2.5 md:p-3 rounded-xl transition-all active:scale-90 ${isActiveRoute ? 'bg-amber-900/30 text-amber-500 border border-amber-700/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent'}`}>
              <item.icon size={22} className="md:w-6 md:h-6" />
            </div>
          </Link>
        );
      })}
      
      <div className="w-[1px] h-8 bg-zinc-800 mx-1" />
      
      <button 
        onClick={toggleTimer}
        title="Session Timer"
        className={`p-2.5 md:p-3 rounded-xl flex items-center justify-center outline-none active:scale-90 transition-all border ${isActive ? 'bg-red-900/20 text-red-500 border-red-900/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-transparent'}`}
      >
        {isActive ? <span className="text-[10px] md:text-xs font-mono font-bold">{formatTime()}</span> : <Timer size={22} className="md:w-6 md:h-6" />}
      </button>

      <button 
        onClick={handleLogout}
        title="Terminate Session"
        className="p-2.5 md:p-3 rounded-xl text-zinc-600 hover:text-red-500 hover:bg-red-900/20 active:scale-90 transition-all outline-none border border-transparent"
      >
        <LogOut size={22} className="md:w-6 md:h-6" />
      </button>
    </nav>
  );
}