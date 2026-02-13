import { Link } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="relative z-10 h-screen w-screen flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 crt-overlay pointer-events-none" />
        <div className="absolute inset-0 animate-scanline bg-[linear-gradient(to_bottom,transparent,rgba(0,255,65,0.1),transparent)] h-20 opacity-20 pointer-events-none" />
      </div>
      
      <header className="border-b border-terminal-fg/30 pb-2 mb-4 flex justify-between items-center text-xs px-4 pt-4">
        <div>SYSTEM: ONLINE | SECTOR: BUNKER-14 | ENCRYPTION: ACTIVE</div>
        <div className="flex gap-4">
          <Link to="/" className="hover:bg-terminal-fg hover:text-terminal-bg px-1">HOME</Link>
          <Link to="/leaderboard" className="hover:bg-terminal-fg hover:text-terminal-bg px-1">LEADERBOARD</Link>
          <Link to="/strategy" className="hover:bg-terminal-fg hover:text-terminal-bg px-1">STRATEGY</Link>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto border border-terminal-fg/20 p-4 bg-terminal-bg/50 backdrop-blur-sm mx-4">
        {children}
      </main>
      
      <footer className="mt-4 pt-2 border-t border-terminal-fg/30 text-[10px] opacity-50 flex justify-between px-4 pb-4">
        <div>NO-LOGIN PERSISTENCE ENABLED</div>
        <div>[C] 2026 MINISTRY OF GAME THEORY</div>
      </footer>
    </div>
  )
}

export default Layout
