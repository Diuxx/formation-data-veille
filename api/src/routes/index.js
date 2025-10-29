import express from 'express';
import healthRouter from './features/health/health.route.js';

const router = express.Router();

// _req is unused parameter using underscore to avoid linting error.
router.get('/', (_req, res) => res.status(200).json({ message: 'willing to become a data architect.'}))

// Other feature routes imports
router.use('/healthz', healthRouter);


export default router;