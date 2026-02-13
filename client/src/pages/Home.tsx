function Home() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter crt-text-glow">
          PRISONER'S ROYALE
        </h1>
        <p className="text-terminal-accent text-sm md:text-base">
          ADAPT OR BE DELETED. THE ULTIMATE ASYNC GAME THEORY TOURNAMENT.
        </p>
      </div>

      <div className="grid gap-6 border border-terminal-fg/20 p-6 bg-terminal-dim/10">
        <section className="space-y-2">
          <h2 className="text-xl border-b border-terminal-fg/30 inline-block">MISSION BRIEFING</h2>
          <p className="text-sm leading-relaxed">
            Welcome, Operative. You are trapped in a digital bunker. Your survival depends on your ability to cooperate—or defect—against other inhabitants.
          </p>
          <p className="text-sm leading-relaxed">
            Every hour, the System runs a tournament. Your logic will be tested against everyone else's. High ELO grants access to deeper bunker levels.
          </p>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <a
            href="/strategy"
            className="flex-1 bg-terminal-fg text-terminal-bg text-center py-3 font-bold hover:bg-terminal-bg hover:text-terminal-fg border border-terminal-fg transition-colors"
          >
            CONFIGURE LOGIC
          </a>
          <a
            href="/leaderboard"
            className="flex-1 border border-terminal-fg text-center py-3 font-bold hover:bg-terminal-fg hover:text-terminal-bg transition-colors"
          >
            VIEW LEADERBOARD
          </a>
        </div>
      </div>

      <div className="text-[10px] space-y-1 opacity-70">
        <div>&gt; INITIALIZING SURVEILLANCE...</div>
        <div>&gt; 128 OPERATIVES ONLINE...</div>
        <div>&gt; NEXT TOURNAMENT IN: 42:15...</div>
      </div>
    </div>
  )
}

export default Home
