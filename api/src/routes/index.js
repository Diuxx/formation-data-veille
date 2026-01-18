import express from 'express';

// routes imports
import healthRouter from './features/health/health.route.js';
import userRouter from './features/user/user.route.js';
import authRouter from './features/authentication/auth.route.js';

const router = express.Router();

// _req is unused parameter using underscore to avoid linting error.
router.get('/', (_req, res) => res.status(200).json({ message: 'willing to become a data architect.'}))

// Other feature routes imports
router.use('/health', healthRouter);
router.use('/users', userRouter);
router.use('/', authRouter);


export default router;