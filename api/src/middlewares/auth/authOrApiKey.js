import { auth } from './auth.js';
import { apiKeyAuth } from './apiKeyAuth.js';

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
    await auth(req, res, () => {}, true);
    if (req.user) return next();

    await apiKeyAuth(req, res, () => {}, true);
    if (req.apiKey) return next();

    return res.status(401).json({ error: 'Unauthorized' });
  }
  catch (_) {
    return res.status(500).json({ error: 'Internal Server Error (Auth)' });
  }  
}
