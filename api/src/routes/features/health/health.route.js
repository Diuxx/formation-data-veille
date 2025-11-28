import express from 'express';
import logger from '../../../middlewares/logger.js';
import { getDatabaseHealth } from './health.service.js';

const router = express.Router();

router.get('/',  async (_req, res) => {
  try {
    logger.info('displaying api status (test)');

    const databaseStatus = await getDatabaseHealth();
    res.status(200).json({ 
      api: 'ok',
      database: databaseStatus ? 'ok' : 'down',
      message: 'API is running'
    });
  }
  catch (err) {
    next(err);
  }
});

export default router;