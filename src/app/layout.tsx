import "./globals.css";
import { FocusProvider } from '@/components/FocusContext';
import { NavigationShell } from '@/components/NavigationShell';

export const metadata = {
  title: "MedNexus OS",
  description: "Next Generation Academic Workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-300 antialiased font-sans selection:bg-amber-900/50">
        <FocusProvider>
          {/* THE FLEX ARCHITECTURE */}
          <div className="flex h-screen overflow-hidden">
            
            {/* The Main Content: Takes up remaining space and scrolls independently */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
              {children}
            </main>

          </div>
          <NavigationShell />
        </FocusProvider>
      </body>
    </html>
  )
}