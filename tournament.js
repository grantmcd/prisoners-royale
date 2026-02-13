import { getPayoff } from './logic.js';

export class Tournament {
  constructor(strategies, roundsPerMatch = 10) {
    this.players = strategies;
    this.roundsPerMatch = roundsPerMatch;
  }

  playMatch(player1, player2) {
    const history1 = [];
    const history2 = [];
    let score1 = 0;
    let score2 = 0;

    for (let i = 0; i < this.roundsPerMatch; i++) {
      const move1 = player1.getMove(history2);
      const move2 = player2.getMove(history1);
      
      const [p1Payoff, p2Payoff] = getPayoff(move1, move2);
      
      score1 += p1Payoff;
      score2 += p2Payoff;
      
      history1.push(move1);
      history2.push(move2);
    }

    return [score1, score2];
  }

  runRound() {
    // Reset scores for this round
    this.players.forEach(p => p.score = 0);

    // Everyone plays everyone
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const [s1, s2] = this.playMatch(this.players[i], this.players[j]);
        this.players[i].score += s1;
        this.players[j].score += s2;
      }
    }

    // Sort by score ascending to find the loser
    this.players.sort((a, b) => a.score - b.score);
    
    console.log('--- Round Results ---');
    this.players.forEach(p => console.log(`${p.name}: ${p.score}`));

    const eliminated = this.players.shift();
    console.log(`ELIMINATED: ${eliminated.name}`);
    console.log('---------------------\n');

    return eliminated;
  }

  runRoyale() {
    console.log(`Starting Prisoners Royale with ${this.players.length} players!\n`);
    
    while (this.players.length > 1) {
      this.runRound();
    }

    const winner = this.players[0];
    console.log(`THE WINNER IS: ${winner.name}`);
    return winner;
  }
}
