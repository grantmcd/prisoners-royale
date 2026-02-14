import express from 'express';
import { runTournament, compileGraphToFunction, createCustomStrategy } from '../game';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/simulate', (req, res) => {
  try {
    const { strategies, customGraph } = req.body;
    
    if (!strategies || !Array.isArray(strategies)) {
       return res.status(400).json({ error: 'Provide an array of strategy names.' });
    }

    const tournamentConfigs: any[] = [...strategies];

    if (customGraph) {
      const compiledFn = compileGraphToFunction(customGraph);
      const customStrat = createCustomStrategy('CustomOperative', compiledFn);
      tournamentConfigs.push(customStrat);
    }

    if (tournamentConfigs.length < 2) {
      return res.status(400).json({ error: 'At least 2 strategies needed for a royale.' });
    }

    const result = runTournament(tournamentConfigs);
    res.json(result);
  } catch (err: any) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
