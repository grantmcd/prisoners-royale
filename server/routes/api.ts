import { Router } from 'express';
import { runTournament, STRATEGIES } from '../game';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'healthy', sector: 'BUNKER-14' });
});

router.post('/simulate', (req, res) => {
  const { strategies } = req.body;

  if (!strategies || !Array.isArray(strategies)) {
    return res.status(400).json({ error: 'Missing or invalid strategies array' });
  }

  // Validate strategies
  const validStrategies = strategies.filter(s => STRATEGIES[s]);
  if (validStrategies.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 valid strategies' });
  }

  try {
    const result = runTournament(validStrategies);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Tournament simulation failed' });
  }
});

export default router;
