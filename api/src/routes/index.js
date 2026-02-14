import express from 'express';
import cookieParser from 'cookie-parser';

// routes imports
import healthRouter from './features/health/health.route.js';
import userRouter from './features/user/user.route.js';
import authRouter from './features/authentication/auth.route.js';
import toolsRouter from './features/tools/tools.route.js';
import stacksRouter from './features/stacks/stacks.route.js';

const router = express.Router();
router.use(cookieParser());

// _req is unused parameter using underscore to avoid linting error.
router.get('/', (_req, res) => res.status(200).json({ message: 'willing to become a data architect.'}))

// Other feature routes imports
router.use('/health', healthRouter);
router.use('/users', userRouter);
router.use('/tools', toolsRouter);
router.use('/stacks', stacksRouter);
router.use('/', authRouter);


export default router;