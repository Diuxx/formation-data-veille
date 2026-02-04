import prisma from '../../database/prisma.js';
import logger from '../logger.js';
import { getClientInfo } from '../../utils/utils.js';
import { v4 as uuidv4 } from 'uuid';

export function audit(action, detailsBuilder = null) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      logger.info(`Audit log middleware triggered for action: ${action}`);

      try {
        // --
        const trigger = req.user ? (req.user.role == 'SYSTEM' ? 'SYSTEM' : 'USER') : 'ANONYMOUS';
        const date = new Date();
        const { ip, userAgent } = await getClientInfo(req);
        
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

        await prisma.audit_logs.create({
          data: {
            id: uuidv4(),
            users: { connect: { id: req.user?.id ?? null } },
            action: action,
            ipAddress: ip || null,
            details: details,
            type: trigger,
            createdAt: date.toISOString()
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