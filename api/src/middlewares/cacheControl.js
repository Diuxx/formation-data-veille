
/**
 * Middleware , to set cached time to a ressource.
 * @param {*} maxAge the ressource age.
 * @param {*} isPublic scope of the ressource.
 */
export const setCache = (maxAge = 0, isPublic = false) => {
    return (_req, res, next) => {
        const visibility = isPublic ? 'public' : 'private';
        res.set('Cache-Control', `${visibility}, max-age=${maxAge}`);

        next();
    }
}