import express from 'express';
import logger from '../../../middlewares/logger.js';

const router = express.Router();

router.get('/',  async (_req, res) => {
  try {
    logger.info('displaying api status (test)')
    res.status(200).json({ status: 'ok' });
  }
  catch (err) {
    next(err);
  }
});

export default router;