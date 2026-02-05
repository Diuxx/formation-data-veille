import prisma from '../../database/prisma.js';

/**
 * Optional authentication check. If a valid session token or API key is present,
 * attaches the user to req.user. Otherwise, leaves req.user null.
 */
export async function isAuthenticate(req, res, next) {
  try {
    req.user = null;

    // Check Bearer session token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const sessionId = authHeader.split(' ')[1];
      const session = await prisma.session.findUnique({ where: { id: sessionId } });
      if (session && new Date(session.expiresAt) > new Date()) {
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (user) {
          req.user = user;
        }
      }
    }

    // Fallback: API key
    if (!req.user) {
      const apiKey = req.headers['x-api-key'];
      if (apiKey) {
        const token = await prisma.token.findUnique({ where: { token: apiKey } });
        if (token && new Date(token.expiresAt) > new Date()) {
          const user = await prisma.user.findUnique({ where: { id: token.userId } });
          if (user) {
            req.user = user;
          }
        }
      }
    }

    return next();
  } catch (_) {
    // Non-blocking: on error, continue without user attached
    return next();
  }
}
