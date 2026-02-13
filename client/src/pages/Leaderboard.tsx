const MOCK_LEADERBOARD = [
  { rank: 1, name: 'ZERO_COOL', elo: 2450, wins: 142, status: 'BUNKER_1' },
  { rank: 2, name: 'ACID_BURN', elo: 2380, wins: 138, status: 'BUNKER_1' },
  { rank: 3, name: 'CEREAL_KILLER', elo: 2210, wins: 120, status: 'BUNKER_2' },
  { rank: 4, name: 'LORD_NIKON', elo: 2150, wins: 115, status: 'BUNKER_2' },
  { rank: 5, name: 'PHREAK', elo: 2040, wins: 98, status: 'BUNKER_3' },
]

function Leaderboard() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">GLOBAL ELO LEADERBOARD</h1>
        <p className="text-xs text-terminal-accent">RANKINGS UPDATED EVERY 60 MINUTES</p>
      </div>

      <div className="border border-terminal-fg/20 bg-terminal-dim/5 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-terminal-fg/10 border-b border-terminal-fg/30">
            <tr>
              <th className="p-3">RANK</th>
              <th className="p-3">OPERATIVE</th>
              <th className="p-3">ELO</th>
              <th className="p-3">WINS</th>
              <th className="p-3">LOCATION</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERBOARD.map((p) => (
              <tr key={p.rank} className="border-b border-terminal-fg/10 hover:bg-terminal-fg/5 transition-colors">
                <td className="p-3 opacity-50">#{p.rank.toString().padStart(2, '0')}</td>
                <td className="p-3 font-bold">{p.name}</td>
                <td className="p-3 text-terminal-fg">{p.elo}</td>
                <td className="p-3">{p.wins}</td>
                <td className="p-3 text-[10px]">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center pt-4">
        <div className="text-[10px] opacity-40">SHOWING TOP 100 OPERATIVES</div>
      </div>
    </div>
  )
}

export default Leaderboard
