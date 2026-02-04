import prisma from '../../database/prisma.js';

/**
 * Authenticates the request using either session authentication or API key authentication.
 * @param {*} req The request object.
 * @param {*} res The response object.
 * @param {*} next The next middleware function.
 * @returns sends 401 if neither authentication method is successful; otherwise, calls next().
 */
export async function authOrApiKey(req, res, next) {
  // reset user and apiKey
  req.user = null;
  req.apiKey = null;

  try {
    const result = await tryAuthWithApiKey(req);

    if (!result) // if no api key was provided, try session auth
      await tryAuth(req);

    if (req.user) {
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized' });
  }
  catch (_) {
    const status = _.cause || 500;
    return res.status(status).json({ error: _.message });
  }  
}

/**
 * This middleware authenticates the request using session authentication.
 * @param {*} req The request object.
 * @returns sends 401 on failure;
 */
export async function tryAuth(req, res) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new Error('Unauthenticated', { cause: 401 });
  }

  // Get user session from the database
  const session = await prisma.sessions.findUnique({
    where: { id: token },
    include: { users: true }
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error('Session expired');
  }

  // -- attach the user to request
  req.user = session.users;
}

/**
 * Authenticates the request using an API key provided in the 'x-api-key' header.
 * @param {*} req The request object.
 * @returns sends 401 or 403 on failure;
 */
export async function tryAuthWithApiKey(req, res) {

    const apiKey = req.headers['x-api-key'];

    /** its not an api request */
    if (!apiKey)
      return false;

    const token = await prisma.tokens.findUnique({
      where: { token: apiKey },
      include: { users: true }
    });

    if (!token) {
      throw new Error('Invalid API key', { cause: 401 });
    }

    if (new Date(token.expiresAt) < new Date()) {
      throw new Error('API Key expired', { cause: 403 });
    }

    // -- attach token and user to request
    req.apiKey = token;
    req.user = token.users;

    return true;
}
