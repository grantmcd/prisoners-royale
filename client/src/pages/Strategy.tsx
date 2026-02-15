import { useState } from 'react'
import LogicBuilder from '../components/LogicBuilder'

interface CompiledStrategy {
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  conditionCount: number;
  sampleMoves: string[];
  status: string;
}

interface TestMatchResult {
  customScore: number;
  opponentScore: number;
  opponent: string;
  rounds: number;
  result: 'win' | 'loss' | 'draw';
  matchLog: { round: number; customMove: string; opponentMove: string }[];
}

function Strategy() {
  const [simResult, setSimResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  // Initialize state from localStorage if available
  const [graph, setGraph] = useState<any>(() => {
    const saved = localStorage.getItem('pr_strategy_graph')
    return saved ? JSON.parse(saved) : null
  })
  const [strategyName, setStrategyName] = useState(() => {
    return localStorage.getItem('pr_strategy_name') || 'CustomOperative'
  })

  const [compiledStrategy, setCompiledStrategy] = useState<CompiledStrategy | null>(null)
  const [compileError, setCompileError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<TestMatchResult | null>(null)
  const [activeTab, setActiveTab] = useState<'build' | 'test' | 'results'>('build')

  // Persist changes
  const handleGraphChange = (newGraph: any) => {
    setGraph(newGraph)
    localStorage.setItem('pr_strategy_graph', JSON.stringify(newGraph))
  }

  const handleNameChange = (newName: string) => {
    setStrategyName(newName)
    localStorage.setItem('pr_strategy_name', newName)
  }

  const compileStrategy = async () => {
    if (!graph || graph.nodes.length <= 1) {
      setCompileError('Build a strategy first! Add at least one ACTION or CONDITION node.')
      return
    }

    setLoading(true)
    setCompileError(null)
    setCompiledStrategy(null)
    setTestResult(null)

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph, name: strategyName })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Compilation failed')
      }

      const data = await res.json()
      setCompiledStrategy(data)
      setActiveTab('test')
    } catch (err: any) {
      setCompileError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const runSimulation = async () => {
    setLoading(true)
    setSimResult(null)
    setTestResult(null)
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategies: ['AlwaysCooperate', 'AlwaysDefect', 'TitForTat', 'Random', 'Grudger', 'Pavlov'],
          customGraph: graph,
          customStrategyName: strategyName
        })
      })
      const data = await res.json()
      setSimResult(data)
      setActiveTab('results')
    } catch (err: any) {
      console.error(err)
      setSimResult({ error: 'Simulation failed: ' + err.message })
      setActiveTab('results')
    } finally {
      setLoading(false)
    }
  }

  const testAgainstBot = async (botName: string) => {
    if (!compiledStrategy) {
      setCompileError('Compile your strategy first!')
      return
    }

    setLoading(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/test-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customGraph: graph,
          opponent: botName,
          rounds: 10
        })
      })
      const data = await res.json()
      setTestResult(data)
    } catch (err: any) {
      setCompileError('Test match failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-terminal-fg/30 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LOGIC CONFIGURATION</h1>
          <p className="text-xs text-terminal-accent">DEFINE YOUR SURVIVAL ALGORITHM</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] opacity-50">OPERATIVE ID:</div>
          <div className="text-sm">B-14-{strategyName.toUpperCase().replace(/[^A-Z0-9]/g, '')}</div>
        </div>
      </div>

      {/* Strategy Name */}
      <div className="border border-terminal-fg/20 p-4 bg-terminal-dim/10 flex items-center gap-4">
        <label className="text-xs font-bold">DESIGNATION:</label>
        <input
          type="text"
          value={strategyName}
          onChange={(e) => handleNameChange(e.target.value)}
          className="bg-terminal-bg border border-terminal-fg/30 p-2 text-sm flex-1 max-w-xs"
          placeholder="Enter strategy name..."
        />
        <button 
          onClick={() => {
            if (confirm('Reset strategy to default?')) {
              handleGraphChange(null) // LogicBuilder handles null -> default reset
              handleNameChange('CustomOperative')
              window.location.reload() // Force reload to clear LogicBuilder internal state easily
            }
          }}
          className="text-[10px] text-red-400 hover:text-red-300 underline"
        >
          RESET DATA
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-terminal-fg/30">
        {(['build', 'test', 'results'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab 
                ? 'bg-terminal-fg text-terminal-bg' 
                : 'hover:bg-terminal-dim/50'
            }`}
          >
            {tab === 'build' && '🔧 Build'}
            {tab === 'test' && '🧪 Test'}
            {tab === 'results' && '🏆 Results'}
          </button>
        ))}
      </div>

      {/* Build Tab */}
      {activeTab === 'build' && (
        <div className="space-y-4">
          <LogicBuilder onChange={handleGraphChange} initialGraph={graph} />
          
          {compileError && (
            <div className="border border-red-500/50 p-4 bg-red-500/10 text-red-400 text-sm font-mono">
              ⚠️ {compileError}
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={compileStrategy}
              disabled={loading}
              className="flex-1 bg-terminal-fg text-terminal-bg font-bold py-3 hover:bg-terminal-bg hover:text-terminal-fg border border-terminal-fg transition-colors disabled:opacity-50"
            >
              {loading ? 'COMPILING...' : 'UPLOAD TO TERMINAL'}
            </button>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          {!compiledStrategy ? (
            <div className="text-center py-12 opacity-50">
              <p>Compile your strategy in the Build tab first.</p>
            </div>
          ) : (
            <>
              {/* Compiled Strategy Info */}
              <div className="border border-green-500/50 p-4 bg-green-500/10">
                <h3 className="font-bold text-green-400 mb-3">✓ STRATEGY COMPILED SUCCESSFULLY</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-terminal-accent">Name:</span> {compiledStrategy.name}</div>
                  <div><span className="text-terminal-accent">Logic:</span> {compiledStrategy.description}</div>
                  <div><span className="text-terminal-accent">Nodes:</span> {compiledStrategy.nodeCount}</div>
                  <div><span className="text-terminal-accent">Connections:</span> {compiledStrategy.edgeCount}</div>
                </div>
                
                <div className="mt-4 border-t border-green-500/30 pt-3">
                  <div className="text-xs font-bold mb-2">BEHAVIOR PREVIEW:</div>
                  <div className="font-mono text-xs space-y-1">
                    {compiledStrategy.sampleMoves.map((move, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="opacity-70">{move.split(':')[0]}</span>
                        <span className={move.includes('COOPERATE') ? 'text-green-400' : 'text-red-400'}>
                          {move.split(': ')[1]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1v1 Test Arena */}
              <div className="space-y-4">
                <h3 className="font-bold">⚔️ 1v1 TEST ARENA</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['TitForTat', 'AlwaysDefect', 'AlwaysCooperate', 'Random', 'Grudger', 'Pavlov'].map(bot => (
                    <button
                      key={bot}
                      onClick={() => testAgainstBot(bot)}
                      className="border border-terminal-fg/30 p-2 text-xs hover:bg-terminal-fg/10"
                    >
                      VS {bot.toUpperCase()}
                    </button>
                  ))}
                </div>

                {testResult && (
                  <div className="border border-terminal-fg/30 p-4 mt-4 bg-terminal-dim/5 animate-fade-in">
                    <div className="flex justify-between mb-2 border-b border-terminal-fg/20 pb-2">
                      <div className="font-bold">RESULT: {testResult.result.toUpperCase()}</div>
                      <div className="text-xs opacity-70">ROUNDS: {testResult.rounds}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 text-center mb-4">
                      <div>
                        <div className="text-2xl font-bold">{testResult.customScore}</div>
                        <div className="text-xs text-terminal-accent">{strategyName}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{testResult.opponentScore}</div>
                        <div className="text-xs text-terminal-accent">{testResult.opponent}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono opacity-60">
                      {testResult.matchLog.map((log, i) => (
                        <div key={i} className="flex justify-between">
                          <span>R{log.round}: {log.customMove.toUpperCase()}</span>
                          <span>vs</span>
                          <span>{log.opponentMove.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-terminal-fg/20">
                <button 
                  onClick={runSimulation}
                  className="w-full bg-terminal-fg text-terminal-bg font-bold py-3 hover:opacity-90"
                >
                  🚀 ENTER BATTLE ROYALE (ALL BOTS)
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {!simResult ? (
            <div className="text-center py-12 opacity-50">
              Run a simulation from the Test tab to see results.
            </div>
          ) : simResult.error ? (
            <div className="border border-red-500 p-4 text-red-500">
              {simResult.error}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border border-terminal-fg p-4 text-center">
                <div className="text-xs tracking-widest opacity-70 mb-1">TOURNAMENT WINNER</div>
                <div className="text-3xl font-bold text-yellow-400 glow">{simResult.winner.toUpperCase()}</div>
                {simResult.customStrategyPlaced && (
                  <div className="mt-2 text-sm text-terminal-accent">
                    Your Strategy Placed: <span className="font-bold">{simResult.customStrategyPlaced}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-bold border-b border-terminal-fg/30 pb-1">LEADERBOARD</h3>
                
                {/* Aggregate Results */}
                <div className="border border-terminal-fg/20 bg-terminal-dim/5">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-terminal-fg/10 text-terminal-accent">
                      <tr>
                        <th className="px-4 py-2">Rank</th>
                        <th className="px-4 py-2">Strategy</th>
                        <th className="px-4 py-2">Rounds Survived</th>
                        <th className="px-4 py-2 text-right">Avg Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Calculate final stats from log */}
                      {(() => {
                        const stats = new Map<string, { survived: number, scoreSum: number, rounds: number }>();
                        
                        // Initialize all strategies
                        const allStrats = new Set<string>();
                        simResult.log.forEach((r: any) => {
                          r.leaderboard.forEach((p: any) => allStrats.add(p.strategy));
                          r.eliminated.forEach((p: any) => allStrats.add(p.strategy));
                        });

                        allStrats.forEach(s => stats.set(s, { survived: 0, scoreSum: 0, rounds: 0 }));

                        simResult.log.forEach((r: any) => {
                          // Everyone in leaderboard survived this round
                          r.leaderboard.forEach((p: any) => {
                            const s = stats.get(p.strategy)!;
                            s.survived = r.round;
                            s.scoreSum += p.score;
                            s.rounds++;
                          });
                          // Eliminated players stopped here
                          r.eliminated.forEach((p: any) => {
                            const s = stats.get(p.strategy)!;
                            s.survived = r.round - 1; // Eliminated at end of prev round effectively
                            s.scoreSum += p.score;
                            s.rounds++;
                          });
                        });

                        return Array.from(stats.entries())
                          .sort((a, b) => b[1].survived - a[1].survived || b[1].scoreSum/b[1].rounds - a[1].scoreSum/a[1].rounds)
                          .map(([name, stat], i) => (
                            <tr key={name} className={`border-b border-terminal-fg/10 ${name === strategyName ? 'bg-terminal-accent/10 font-bold' : ''}`}>
                              <td className="px-4 py-2">#{i + 1}</td>
                              <td className="px-4 py-2">{name}</td>
                              <td className="px-4 py-2">{stat.survived}</td>
                              <td className="px-4 py-2 text-right">{(stat.scoreSum / stat.rounds).toFixed(1)}</td>
                            </tr>
                          ));
                      })()}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 mt-8">
                  <h3 className="font-bold border-b border-terminal-fg/30 pb-1 opacity-50">ROUND LOGS</h3>
                  {simResult.log.map((round: any, i: number) => (
                    <div key={i} className="text-xs border-l-2 border-terminal-fg/10 pl-3 py-1 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between font-mono">
                        <span className="text-terminal-accent">R{round.round}</span>
                        <span>{round.survivors} LEFT</span>
                      </div>
                      {round.eliminated.length > 0 && (
                        <div className="text-red-400 mt-1">
                          💀 ELIMINATED: {round.eliminated.map((e: any) => `${e.strategy} (${e.score})`).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Strategy