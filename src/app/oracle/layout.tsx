import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function OracleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="h-[100dvh] bg-[#050505] text-zinc-100 overflow-hidden">
      {children}
    </div>
  )
}