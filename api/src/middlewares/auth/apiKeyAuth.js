import prisma from '../../database/prisma.js';
import logger from '../logger.js';

/**
 * Authenticates the request using an API key provided in the 'x-api-key' header.
 * @param {*} req The request object.
 * @param {*} res The response object.
 * @param {*} next The next middleware function.
 * @returns sends 401 or 403 on failure; otherwise, calls next().
 */
export async function apiKeyAuth(req, res, next, silent = false) {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      if (silent) 
        return;

      return res.status(401).json({ error: 'API key required (header: x-api-key)' });
    }

    const token = await prisma.token.findUnique({
      where: { token: apiKey },
      include: { User: true }
    });

    if (!token) {
      if (silent) 
        return;

      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (new Date(token.expiresAt) < new Date()) {
      if (silent) 
        return;

      return res.status(403).json({ error: 'API Key expired' });
    }

    // -- attach token and user to request
    req.apiKey = token;
    req.user = token.User;

    return next();
  }
  catch (error) {
    logger.error(error);
    logger.error('API Key Auth Error:');
    if (silent) 
      throw error;

    return res.status(500).json({ error: 'Internal Server Error (API Key)' });
  }
}