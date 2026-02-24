"use client"
import { setCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import { Smartphone, Tablet, Monitor, ArrowRight } from 'lucide-react'

export default function DeviceSelect() {
  const router = useRouter()

  const selectMode = (mode: 'mobile' | 'tablet' | 'desktop') => {
    // Set a cookie that lasts 365 days
    setCookie('mednexus_device_mode', mode, { maxAge: 60 * 60 * 24 * 365 })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-100 tracking-tight">
            Aygıt Seçimini Yap
          </h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
            Cihaza özel tasarlanmış ve geliştirilmiş arayüzler 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          
          {/* OPTION 1: THE SCOUT (Phone) */}
          <button 
            onClick={() => selectMode('mobile')}
            className="group relative p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-red-900/50 transition-all duration-300 text-left"
          >
            <div className="p-4 rounded-2xl bg-black border border-zinc-800 w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Smartphone size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-200 group-hover:text-red-400 transition-colors">Telefon</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Minimal ve dikey odaklı CSS. Okuma, revizyon ve minimalistik notlar almak için tasarlandı.
            </p>
          </button>

          {/* OPTION 2: THE ARTIST (Tablet) */}
          <button 
            onClick={() => selectMode('tablet')}
            className="group relative p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-amber-900/50 transition-all duration-300 text-left"
          >
            <div className="p-4 rounded-2xl bg-black border border-zinc-800 w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Tablet size={32} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">Tablet</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Hibrit arayüz. Hem Canvas ile çizim hem de Editor ile ders notları. İşlevsel ve hızlı sistem.
            </p>
          </button>

          {/* OPTION 3: THE ARCHITECT (PC) */}
          <button 
            onClick={() => selectMode('desktop')}
            className="group relative p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-blue-900/50 transition-all duration-300 text-left"
          >
            <div className="p-4 rounded-2xl bg-black border border-zinc-800 w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Monitor size={32} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">Bilgisayar</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Geniş ve rahat CSS, fonksiyonel bolluk. Esas ve temiz notların alındığı sistem.
            </p>
          </button>

        </div>
      </div>
    </div>
  )
}