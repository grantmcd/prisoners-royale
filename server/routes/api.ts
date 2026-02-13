import express from 'express';
import { runTournament } from '../game';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/simulate', (req, res) => {
  try {
    const { strategies } = req.body;
    
    if (!strategies || !Array.isArray(strategies) || strategies.length < 2) {
       return res.status(400).json({ error: 'Provide an array of at least 2 strategy names.' });
    }

    const result = runTournament(strategies);
    res.json(result);
  } catch (err: any) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
