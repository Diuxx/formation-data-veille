

/**
 * Verifies if the user has admin privileges.
 * @param {*} req The request object.
 * @param {*} res The response object.
 * @param {*} next The next middleware function.
 * @returns {void}
 */
export function isAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SYSTEM')) {
    return res.status(403).json({ error: 'Forbidden: admin or system only' });
  }

  return next();
}