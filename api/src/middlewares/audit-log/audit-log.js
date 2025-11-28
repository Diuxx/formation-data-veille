import prisma from '../../database/prisma.js';
import logger from '../logger.js';
import { v4 as uuidv4 } from 'uuid';

export function audit(action, detailsBuilder = null) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      try {
        // --
        const userId =
          req.user?.id ??
          null;

        const trigger = req.user ? (req.user.role == 'SYSTEM' ? 'SYSTEM' : 'USER') : 'ANONYMOUS';
        const date = new Date();

        let details = null;
        if (typeof detailsBuilder === 'function') {
          try {
            details = detailsBuilder(req);
          } catch {
            details = null;
          }
        } 
        else if (req.body) {
          details = JSON.stringify({ 
            ...req.body,
            password: ''
          });
        }

        await prisma.auditLog.create({
          data: {
            id: uuidv4(),
            userId: userId,
            action: action,
            trigger: trigger,
            ipAddress: req.ip || null,
            details: details,
            createdAt: date
          }
        });
      }
      catch(error) {
        logger.error(error);
      }
    });

    next();
  };
}