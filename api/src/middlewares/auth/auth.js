import prisma from '../../database/prisma.js';
import logger from '../logger.js';

/**
 * This middleware authenticates the request using session authentication.
 * @param {*} req The request object.
 * @param {*} res The response object.
 * @param {*} next The next middleware function.
 * @returns sends 401 on failure; otherwise, calls next().
 */
export async function auth(req, res, next, silent = false) {
  try {
    console.log(req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      if (silent) 
        return;

      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // Get user session from the database
    const session = await prisma.session.findUnique({
      where: { id: token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      if (silent) 
        return;

      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = session.user;

    return next();
  } 
  catch (error) {
    logger.error(error);
    if (silent) 
      throw error;

    return res.status(401).json({ error: 'Invalid token' });
  }
}