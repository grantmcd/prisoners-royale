import { AlwaysCooperate, AlwaysDefect, TitForTat, RandomStrategy } from './logic.js';
import { Tournament } from './tournament.js';

const players = [
  new AlwaysCooperate(),
  new AlwaysDefect(),
  new TitForTat(),
  new RandomStrategy()
];

const tournament = new Tournament(players, 20); // 20 rounds per match
tournament.runRoyale();
