// Payoffs
export const PAYOFFS = {
  BOTH_COOPERATE: 3,
  BOTH_DEFECT: 1,
  TEMPTATION: 5, // You defect, they cooperate
  SUCKER: 0      // You cooperate, they defect
};

export type Move = 'cooperate' | 'defect';
export type History = { myMove: Move, opponentMove: Move }[];

export interface Strategy {
  name: string;
  makeMove(history: History): Move;
}

export function createCustomStrategy(name: string, makeMove: (history: History) => Move): Strategy {
  return { name, makeMove };
}

// Strategies
export const strategies: Record<string, Strategy> = {
  AlwaysCooperate: {
    name: 'AlwaysCooperate',
    makeMove: () => 'cooperate'
  },
  AlwaysDefect: {
    name: 'AlwaysDefect',
    makeMove: () => 'defect'
  },
  TitForTat: {
    name: 'TitForTat',
    makeMove: (history) => {
      if (history.length === 0) return 'cooperate';
      return history[history.length - 1].opponentMove;
    }
  },
  Grudger: {
    name: 'Grudger',
    makeMove: (history) => {
      const opponentDefected = history.some(h => h.opponentMove === 'defect');
      return opponentDefected ? 'defect' : 'cooperate';
    }
  },
  Pavlov: {
    name: 'Pavlov',
    makeMove: (history) => {
      if (history.length === 0) return 'cooperate';
      const last = history[history.length - 1];
      return last.myMove === last.opponentMove ? 'cooperate' : 'defect';
    }
  },
  Random: {
    name: 'Random',
    makeMove: () => Math.random() < 0.5 ? 'cooperate' : 'defect'
  }
};

// Simulation Logic
export interface Player {
  id: string;
  strategyName: string;
  score: number;
  alive: boolean;
  history: Record<string, History>; // OpponentID -> History
}

export function playRound(p1: Player, p2: Player) {
  const s1 = strategies[p1.strategyName];
  const s2 = strategies[p2.strategyName];

  // Get history from p1's perspective for p1, and p2's perspective for p2
  const h1 = p1.history[p2.id] || [];
  const h2 = p2.history[p1.id] || [];

  const m1 = s1.makeMove(h1);
  const m2 = s2.makeMove(h2);

  let score1 = 0;
  let score2 = 0;

  if (m1 === 'cooperate' && m2 === 'cooperate') {
    score1 = PAYOFFS.BOTH_COOPERATE;
    score2 = PAYOFFS.BOTH_COOPERATE;
  } else if (m1 === 'defect' && m2 === 'defect') {
    score1 = PAYOFFS.BOTH_DEFECT;
    score2 = PAYOFFS.BOTH_DEFECT;
  } else if (m1 === 'defect' && m2 === 'cooperate') {
    score1 = PAYOFFS.TEMPTATION;
    score2 = PAYOFFS.SUCKER;
  } else { // m1 cooperate, m2 defect
    score1 = PAYOFFS.SUCKER;
    score2 = PAYOFFS.TEMPTATION;
  }

  p1.score += score1;
  p2.score += score2;

  // Update history
  if (!p1.history[p2.id]) p1.history[p2.id] = [];
  if (!p2.history[p1.id]) p2.history[p1.id] = [];

  p1.history[p2.id].push({ myMove: m1, opponentMove: m2 });
  p2.history[p1.id].push({ myMove: m2, opponentMove: m1 });

  return { p1Move: m1, p2Move: m2, p1Score: score1, p2Score: score2 };
}

export function runTournament(playerConfigs: (string | Strategy)[]) {
  // Init players
  let players: Player[] = playerConfigs.map((config, i) => {
    const strat = typeof config === 'string' ? strategies[config] : config;
    if (!strat) throw new Error(`Strategy not found: ${config}`);
    
    return {
      id: `p${i}_${strat.name}`,
      strategyName: strat.name,
      score: 0,
      alive: true,
      history: {},
      _instance: strat // Store the actual strategy object
    };
  });

  const roundsLog = [];
  let roundNum = 1;

  while (players.filter(p => p.alive).length > 1) {
    const activePlayers = players.filter(p => p.alive);
    
    activePlayers.forEach(p => p.score = 0); 
    
    const INTERACTIONS_PER_MATCH = 10;

    for (let i = 0; i < activePlayers.length; i++) {
      for (let j = i + 1; j < activePlayers.length; j++) {
        const p1 = activePlayers[i];
        const p2 = activePlayers[j];
        
        for (let k = 0; k < INTERACTIONS_PER_MATCH; k++) {
           // Refactored playRound logic inline or modified to accept instances
           const s1 = (p1 as any)._instance;
           const s2 = (p2 as any)._instance;

           const h1 = p1.history[p2.id] || [];
           const h2 = p2.history[p1.id] || [];

           const m1 = s1.makeMove(h1);
           const m2 = s2.makeMove(h2);

           let score1 = 0, score2 = 0;
           if (m1 === 'cooperate' && m2 === 'cooperate') { score1 = 3; score2 = 3; }
           else if (m1 === 'defect' && m2 === 'defect') { score1 = 1; score2 = 1; }
           else if (m1 === 'defect' && m2 === 'cooperate') { score1 = 5; score2 = 0; }
           else { score1 = 0; score2 = 5; }

           p1.score += score1; p2.score += score2;
           if (!p1.history[p2.id]) p1.history[p2.id] = [];
           if (!p2.history[p1.id]) p2.history[p1.id] = [];
           p1.history[p2.id].push({ myMove: m1, opponentMove: m2 });
           p2.history[p1.id].push({ myMove: m2, opponentMove: m1 });
        }
      }
    }

    activePlayers.sort((a, b) => a.score - b.score);
    const lowestScore = activePlayers[0].score;
    const eliminated = activePlayers.filter(p => p.score === lowestScore);
    eliminated.forEach(p => p.alive = false);

    roundsLog.push({
      round: roundNum++,
      survivors: activePlayers.length,
      eliminated: eliminated.map(p => ({ id: p.id, strategy: p.strategyName, score: p.score })),
      leaderboard: activePlayers.map(p => ({ id: p.id, strategy: p.strategyName, score: p.score }))
    });
  }

  const winner = players.find(p => p.alive);
  return {
    winner: winner ? winner.strategyName : 'Draw',
    log: roundsLog
  };
}
