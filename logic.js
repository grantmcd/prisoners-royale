// Payoffs: C/C=3, D/D=1, D/C=5/0
export const PAYOFFS = {
  COOPERATE: 'C',
  DEFECT: 'D'
};

export const getPayoff = (move1, move2) => {
  if (move1 === PAYOFFS.COOPERATE && move2 === PAYOFFS.COOPERATE) return [3, 3];
  if (move1 === PAYOFFS.DEFECT && move2 === PAYOFFS.DEFECT) return [1, 1];
  if (move1 === PAYOFFS.DEFECT && move2 === PAYOFFS.COOPERATE) return [5, 0];
  if (move1 === PAYOFFS.COOPERATE && move2 === PAYOFFS.DEFECT) return [0, 5];
  throw new Error('Invalid moves');
};

export class Strategy {
  constructor(name) {
    this.name = name;
    this.score = 0;
  }

  getMove(history) {
    throw new Error('getMove must be implemented');
  }

  reset() {
    this.score = 0;
  }
}

export class AlwaysCooperate extends Strategy {
  constructor() { super('AlwaysCooperate'); }
  getMove() { return PAYOFFS.COOPERATE; }
}

export class AlwaysDefect extends Strategy {
  constructor() { super('AlwaysDefect'); }
  getMove() { return PAYOFFS.DEFECT; }
}

export class TitForTat extends Strategy {
  constructor() { super('TitForTat'); }
  getMove(opponentHistory) {
    if (opponentHistory.length === 0) return PAYOFFS.COOPERATE;
    return opponentHistory[opponentHistory.length - 1];
  }
}

export class RandomStrategy extends Strategy {
  constructor() { super('Random'); }
  getMove() {
    return Math.random() > 0.5 ? PAYOFFS.COOPERATE : PAYOFFS.DEFECT;
  }
}
