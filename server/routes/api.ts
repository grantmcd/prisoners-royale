import express from 'express';
import { runTournament, compileGraphToFunction, createCustomStrategy, playRound, strategies as builtInStrategies } from '../game';
import type { StrategyGraph, History } from '../game';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Compile a custom strategy and return its behavior analysis
router.post('/compile', (req, res) => {
  try {
    const { graph, name } = req.body;
    
    if (!graph || !graph.nodes || !graph.edges) {
      return res.status(400).json({ error: 'Invalid graph structure. Must include nodes and edges.' });
    }

    // Validate graph has at least a START and one other node
    const hasStart = graph.nodes.some((n: any) => n.type === 'START');
    const hasMove = graph.nodes.some((n: any) => n.type === 'MOVE');
    
    if (!hasStart) {
      return res.status(400).json({ error: 'Graph must have a START node.' });
    }
    if (!hasMove) {
      return res.status(400).json({ error: 'Graph must have at least one MOVE (ACTION) node.' });
    }

    // Compile the strategy
    const compiledFn = compileGraphToFunction(graph);
    
    // Generate sample moves for analysis
    const sampleMoves: string[] = [];
    const testHistories: History[] = [
      [], // First move
      [{ myMove: 'cooperate', opponentMove: 'cooperate' }], // Mutual cooperation
      [{ myMove: 'defect', opponentMove: 'cooperate' }], // Exploited
      [{ myMove: 'cooperate', opponentMove: 'defect' }], // Got suckered
      [{ myMove: 'defect', opponentMove: 'defect' }], // Mutual defection
    ];
    
    for (const history of testHistories) {
      try {
        const move = compiledFn(history);
        const desc = history.length === 0 ? 'First move' : 
          `After (${history[history.length-1].myMove}, ${history[history.length-1].opponentMove})`;
        sampleMoves.push(`${desc}: ${move.toUpperCase()}`);
      } catch (e) {
        sampleMoves.push('Error evaluating');
      }
    }

    // Try to generate a human-readable description
    const nodeCount = graph.nodes.length;
    const edgeCount = graph.edges.length;
    const conditionCount = graph.nodes.filter((n: any) => n.type === 'CONDITION').length;
    
    let description = `Strategy with ${nodeCount} nodes (${conditionCount} condition branches)`;
    
    // Analyze first logic node
    const startNode = graph.nodes.find((n: any) => n.type === 'START');
    const startEdge = graph.edges.find((e: any) => e.from === startNode?.id);
    const firstLogicNode = startEdge ? graph.nodes.find((n: any) => n.id === startEdge.to) : null;
    
    if (firstLogicNode) {
      if (firstLogicNode.type === 'MOVE') {
        description = `Always ${firstLogicNode.data?.move || 'cooperate'}`;
      } else if (firstLogicNode.type === 'CONDITION') {
        const ctype = firstLogicNode.data?.conditionType || 'OPPONENT_LAST';
        const expected = firstLogicNode.data?.expectedMove || 'defect';
        description = `Conditional: checks ${ctype.toLowerCase().replace('_', ' ')} ${expected}`;
      }
    }

    res.json({
      name: name || 'CustomOperative',
      description,
      nodeCount,
      edgeCount,
      conditionCount,
      sampleMoves,
      status: 'compiled',
      graph: { nodes: graph.nodes.length, edges: graph.edges.length }
    });
  } catch (err: any) {
    console.error('Compilation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test a custom strategy against a single opponent
router.post('/test-match', (req, res) => {
  try {
    const { customGraph, opponent, rounds = 10 } = req.body;
    
    if (!customGraph) {
      return res.status(400).json({ error: 'Must provide customGraph.' });
    }
    if (!opponent || !builtInStrategies[opponent]) {
      return res.status(400).json({ error: `Unknown opponent: ${opponent}. Valid: ${Object.keys(builtInStrategies).join(', ')}` });
    }

    // Create custom strategy
    const compiledFn = compileGraphToFunction(customGraph);
    const customStrat = createCustomStrategy('Custom', compiledFn);
    const opponentStrat = builtInStrategies[opponent];

    // Simulate match
    let customScore = 0;
    let opponentScore = 0;
    const matchLog: { round: number; customMove: string; opponentMove: string }[] = [];
    
    const customHistory: History = [];
    const opponentHistory: History = [];

    for (let i = 0; i < rounds; i++) {
      const customMove = customStrat.makeMove(customHistory);
      const opponentMove = opponentStrat.makeMove(opponentHistory);
      
      // Scoring
      let cPoints = 0, oPoints = 0;
      if (customMove === 'cooperate' && opponentMove === 'cooperate') { cPoints = 3; oPoints = 3; }
      else if (customMove === 'defect' && opponentMove === 'defect') { cPoints = 1; oPoints = 1; }
      else if (customMove === 'defect' && opponentMove === 'cooperate') { cPoints = 5; oPoints = 0; }
      else { cPoints = 0; oPoints = 5; }
      
      customScore += cPoints;
      opponentScore += oPoints;
      
      customHistory.push({ myMove: customMove, opponentMove: opponentMove });
      opponentHistory.push({ myMove: opponentMove, opponentMove: customMove });
      
      matchLog.push({ round: i + 1, customMove, opponentMove });
    }
    
    res.json({
      customScore,
      opponentScore,
      opponent,
      rounds,
      result: customScore > opponentScore ? 'win' : customScore < opponentScore ? 'loss' : 'draw',
      matchLog: matchLog.slice(0, 10) // First 10 rounds
    });
  } catch (err: any) {
    console.error('Test match error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/simulate', (req, res) => {
  try {
    const { strategies, customGraph, customStrategyName } = req.body;
    
    if (!strategies || !Array.isArray(strategies)) {
      return res.status(400).json({ error: 'Provide an array of strategy names.' });
    }

    const tournamentConfigs: any[] = [...strategies];
    
    if (customGraph) {
      const compiledFn = compileGraphToFunction(customGraph);
      const customStrat = createCustomStrategy(customStrategyName || 'CustomOperative', compiledFn);
      tournamentConfigs.push(customStrat);
    }

    if (tournamentConfigs.length < 2) {
      return res.status(400).json({ error: 'At least 2 strategies needed for a royale.' });
    }

    const result = runTournament(tournamentConfigs);
    
    // Find custom strategy placement if it participated
    let customPlaced: string | null = null;
    if (customGraph) {
      const customName = customStrategyName || 'CustomOperative';
      for (const round of result.log) {
        const customPlayer = round.leaderboard.find((p: any) => p.strategy === customName);
        if (customPlayer && !round.eliminated.some((e: any) => e.strategy === customName)) {
          customPlaced = `${round.survivors}th`;
        }
      }
      if (result.winner === customName) {
        customPlaced = '1st (WINNER)';
      }
    }
    
    res.json({ ...result, customStrategyPlaced: customPlaced });
  } catch (err: any) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;