
import { Router } from 'express';
import { ActionEvt, RequestMessage } from '../../../utils/utils.js';
import { audit } from '../../../middlewares/audit-log/audit-log.js';
import logger from '../../../middlewares/logger.js';
import { loginSchema, registerSchema } from './auth.schema.js'
import AuthService from './auth.service.js';
import { isAuthenticate } from '../../../middlewares/auth/isAuthenticated.js';
import { authOrApiKey } from '../../../middlewares/auth/authOrApiKey.js';


const router = Router();

/**
 * GET /check
 * 
 * Checks if the user is authenticated and returns user info if so.
 */
router.get('/check', authOrApiKey, async (req, res) => {
  try {
    if (req.user) {
      return res.status(200).json({
        authenticated: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        }
      });
    } 
    else {
      return res.status(200).json({ authenticated: false });
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /login
 * 
 * Authenticates a user and starts a session.
 */
router.post('/login', audit(ActionEvt.AUTHENTICATE), async (req, res) => {
  try {
    const parsedBody = await loginSchema.safeParseAsync(req.body);
    if (!parsedBody.success)
      return res.status(400).json(
        { 
          error: RequestMessage.INVALID_REQUEST_DATA,
          detail: parsedBody.error.flatten() 
        });
  
    const auth = await AuthService.Authenticate(parsedBody.data, req);
    if (!auth.success)
      return res.status(400).json({ 
        error: RequestMessage.INVALID_CREDENTIALS
      });

    // login successful, set cookie
    res.cookie('session_id', auth.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(auth.expiresAt),
      path: '/',
    });
  
    // Authentication logic here
    res.status(200).json({ 
      message: 'Login successful'
    });
  }
  catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /logout
 * 
 * Logs out a user and ends the session.
 */
router.post('/logout', authOrApiKey, audit(ActionEvt.LOGOUT), async (req, res) => {
  try {
    const result = await AuthService.Logout(req.cookies?.session_id);

    if (!result.success) {
      return res.status(400).json({ error: RequestMessage.INVALID_REQUEST_DATA });
    }

    // -- remove cookie
    res.clearCookie('session_id', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({ message: 'Logout successful' });
  }
  catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /register
 * 
 * Registers a new user.
 */
router.post('/register', async (req, res) => {
  try {
    const result = await registerSchema.safeParseAsync(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: RequestMessage.INVALID_REQUEST_DATA,
        details: result.error.flatten()
      });
    }

    const user = await AuthService.register(result.data);
    if (!user) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    return res.status(201).json({
      data: user
    });
  } 
  catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



export default router;