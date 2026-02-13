
export type Move = 'C' | 'D';

export interface Strategy {
  name: string;
  nextMove: (history: Move[], opponentHistory: Move[]) => Move;
}

export const AlwaysCooperate: Strategy = {
  name: 'Always Cooperate',
  nextMove: () => 'C',
};

export const AlwaysDefect: Strategy = {
  name: 'Always Defect',
  nextMove: () => 'D',
};

export const TitForTat: Strategy = {
  name: 'Tit For Tat',
  nextMove: (history, opponentHistory) => {
    if (opponentHistory.length === 0) return 'C';
    return opponentHistory[opponentHistory.length - 1];
  },
};

export const Random: Strategy = {
  name: 'Random',
  nextMove: () => (Math.random() > 0.5 ? 'C' : 'D'),
};

export const STRATEGIES: Record<string, Strategy> = {
  AlwaysCooperate,
  AlwaysDefect,
  TitForTat,
  Random,
};

export interface Player {
  id: string;
  strategyName: string;
  score: number;
}

export interface RoundResult {
  player1Move: Move;
  player2Move: Move;
  player1Score: number;
  player2Score: number;
}

export const PAYOFFS = {
  CC: [3, 3],
  CD: [0, 5],
  DC: [5, 0],
  DD: [1, 1],
};

export function playRound(p1Move: Move, p2Move: Move): [number, number] {
  if (p1Move === 'C' && p2Move === 'C') return [3, 3];
  if (p1Move === 'C' && p2Move === 'D') return [0, 5];
  if (p1Move === 'D' && p2Move === 'C') return [5, 0];
  return [1, 1];
}

export interface TournamentStep {
  remainingPlayers: Player[];
  eliminatedPlayerId?: string;
  matchups: {
    p1Id: string;
    p2Id: string;
    p1Move: Move;
    p2Move: Move;
  }[];
}

export function runTournament(initialStrategies: string[]) {
  let players: Player[] = initialStrategies.map((name, index) => ({
    id: `player-${index}-${name}`,
    strategyName: name,
    score: 0,
  }));

  const history: Record<string, Move[]> = {};
  players.forEach(p => history[p.id] = []);

  const results: TournamentStep[] = [];

  while (players.length > 1) {
    const roundMatchups: TournamentStep['matchups'] = [];
    
    // Play everyone against everyone else in this round
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const p1 = players[i];
        const p2 = players[j];
        
        const strat1 = STRATEGIES[p1.strategyName] || Random;
        const strat2 = STRATEGIES[p2.strategyName] || Random;

        const move1 = strat1.nextMove(history[p1.id], history[p2.id]);
        const move2 = strat2.nextMove(history[p2.id], history[p1.id]);

        const [s1, s2] = playRound(move1, move2);
        
        p1.score += s1;
        p2.score += s2;

        history[p1.id].push(move1);
        history[p2.id].push(move2);

        roundMatchups.push({
          p1Id: p1.id,
          p2Id: p2.id,
          p1Move: move1,
          p2Move: move2,
        });
      }
    }

    // Sort by score ascending to find the loser
    players.sort((a, b) => a.score - b.score);
    const eliminated = players.shift();

    results.push({
      remainingPlayers: JSON.parse(JSON.stringify(players)),
      eliminatedPlayerId: eliminated?.id,
      matchups: roundMatchups,
    });
  }

  return {
    steps: results,
    winner: players[0],
  };
}
