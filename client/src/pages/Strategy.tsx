import { useState } from 'react'
import LogicBuilder from '../components/LogicBuilder'

function Strategy() {
  const [simResult, setSimResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [graph, setGraph] = useState<any>(null)

  const runSimulation = async () => {
    setLoading(true)
    setSimResult(null)
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategies: ['AlwaysCooperate', 'AlwaysDefect', 'TitForTat', 'Random', 'Grudger', 'Pavlov'],
          customGraph: graph
        })
      })
      const data = await res.json()
      setSimResult(data)
    } catch (err) {
      console.error(err)
      setSimResult({ error: 'Simulation failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div className="flex justify-between items-end border-b border-terminal-fg/30 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LOGIC CONFIGURATION</h1>
          <p className="text-xs text-terminal-accent">DEFINE YOUR SURVIVAL ALGORITHM</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] opacity-50">OPERATIVE ID:</div>
          <div className="text-sm">B-14-RANDOM-HASH</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-4">
          <LogicBuilder onChange={setGraph} />
          
          <div className="flex gap-4">
            <button className="flex-1 bg-terminal-fg text-terminal-bg font-bold py-2 hover:bg-terminal-bg hover:text-terminal-fg border border-terminal-fg transition-colors">
              UPLOAD TO TERMINAL
            </button>
            <button 
              onClick={runSimulation}
              disabled={loading}
              className="flex-1 border border-terminal-fg py-2 hover:bg-terminal-dim transition-colors disabled:opacity-50"
            >
              {loading ? 'SIMULATING...' : 'TEST SIMULATION'}
            </button>
          </div>

          {simResult && (
            <div className="border border-terminal-fg/20 p-4 bg-terminal-dim/10 text-xs font-mono">
              <h3 className="font-bold border-b border-terminal-fg/30 mb-2">SIMULATION RESULTS</h3>
              {simResult.error ? (
                <div className="text-red-500">{simResult.error}</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-terminal-accent text-lg">WINNER: {simResult.winner}</div>
                  <div className="max-h-40 overflow-y-auto space-y-1 opacity-80">
                    {simResult.log.map((round: any, i: number) => (
                      <div key={i}>
                        R{round.round}: {round.survivors} alive. Eliminated: {round.eliminated.map((p: any) => p.strategy).join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 text-xs">
          <div className="border border-terminal-fg/20 p-3 bg-terminal-dim/10">
            <h3 className="font-bold mb-2 border-b border-terminal-fg/30">REFERENCE</h3>
            <ul className="space-y-2 list-disc pl-4 opacity-80">
              <li><span className="text-terminal-fg">START</span>: Execution begins here.</li>
              <li><span className="text-terminal-fg">MOVE</span>: Final decision for the round.</li>
              <li><span className="text-terminal-fg">CONDITION</span>: Branch logic based on history.</li>
            </ul>
          </div>
          
          <div className="border border-terminal-fg/20 p-3 bg-terminal-dim/10">
            <h3 className="font-bold mb-2 border-b border-terminal-fg/30">HISTORY</h3>
            <div className="font-mono text-[10px] space-y-1">
              <div>ROUND 1: C | C</div>
              <div>ROUND 2: C | D</div>
              <div>ROUND 3: D | D</div>
              <div className="animate-pulse">_</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Strategy
