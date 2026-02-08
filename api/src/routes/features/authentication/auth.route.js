
import { Router } from 'express';
import { ActionEvt, RequestMessage } from '../../../utils/utils.js';
import { audit } from '../../../middlewares/audit-log/audit-log.js';
import logger from '../../../middlewares/logger.js';
import { loginSchema, registerSchema, forgotPwdSchema, resetPwdSchema } from './auth.schema.js'
import AuthService from './auth.service.js';
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
    return res.status(500).json({ 
      error: {
        code: 'SERVER_ERROR',
        message: RequestMessage.SERVER_ERROR,
        detail: {}
      }
    });
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
      return res.status(400).json({ 
          error: {
            code: 'INVALID_REQUEST_DATA',
            message: RequestMessage.INVALID_REQUEST_DATA,
            detail: parsedBody.error.flatten() 
          }
        });
  
    const auth = await AuthService.Authenticate(parsedBody.data, req);
    if (!auth.success)
      return res.status(401).json({ 
        error: {
          code: 'INVALID_CREDENTIALS',
          message: RequestMessage.INVALID_CREDENTIALS,
          detail: {}
        }
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
    return res.status(500).json({ 
      error: {
        code: 'SERVER_ERROR',
        message: RequestMessage.SERVER_ERROR,
        detail: {}
      }
    });
  }
});

/**
 * POST /logout
 * 
 * Logs out a user and ends the session.
 */
router.post('/logout', authOrApiKey, audit(ActionEvt.LOGOUT), async (req, res) => {
  try {
    const parsedBody = await AuthService.Logout(req.cookies?.session_id);
    if (!parsedBody.success) {
      return res.status(400).json({ 
          error: {
            code: 'INVALID_REQUEST_DATA',
            message: RequestMessage.INVALID_REQUEST_DATA,
            detail: parsedBody.error.flatten() 
          }
        });
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
    return res.status(500).json({ 
      error: {
        code: 'SERVER_ERROR',
        message: RequestMessage.SERVER_ERROR,
        detail: {}
      }
    });
  }
});

/**
 * POST /register
 * 
 * Registers a new user.
 */
router.post('/register', async (req, res) => {
  try {
    const parsedBody = await registerSchema.safeParseAsync(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ 
          error: {
            code: 'INVALID_REQUEST_DATA',
            message: RequestMessage.INVALID_REQUEST_DATA,
            detail: parsedBody.error.flatten() 
          }
        });
    }

    const user = await AuthService.register(parsedBody.data);
    if (!user) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    return res.status(201).json({ data: user });
  } 
  catch (error) {
    logger.error(error);
    return res.status(500).json({ 
      error: {
        code: 'SERVER_ERROR',
        message: RequestMessage.SERVER_ERROR,
        detail: {}
      }
    });
  }
});

/**
 * 
 */
router.post("/reset-password", async (req, res) => {
  try {
    const parsedBody = await resetPwdSchema.safeParseAsync(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ 
          error: {
            code: 'INVALID_REQUEST_DATA',
            message: RequestMessage.INVALID_REQUEST_DATA,
            detail: parsedBody.error.flatten() 
          }
        });
    }
    // --
    const result = await AuthService.resetPassword(parsedBody.data);
    if (!result) {
      return res.status(400).json({
        error: {
          code: 'INVALID_TOKEN',
          message: RequestMessage.INVALID_TOKEN,
        }
      });
    }

    res.status(200).json({ message: "password has been resets" })
  }
  catch (error) {
    logger.error(error);
    return res.status(500).json({ 
      error: {
        code: 'SERVER_ERROR',
        message: RequestMessage.SERVER_ERROR,
        detail: {}
      }
    });
  }
})

/**
 * 
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const parsedBody = await forgotPwdSchema.safeParseAsync(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ 
          error: {
            code: 'INVALID_REQUEST_DATA',
            message: RequestMessage.INVALID_REQUEST_DATA,
            detail: parsedBody.error.flatten() 
          }
        });
    }
    // --
    const result = await AuthService.remindPassword(parsedBody.data);
    if (!result) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST_DATA',
          message: RequestMessage.INVALID_REQUEST_DATA,
        }
      })
    }

    res.status(200).json({ message: "email has been sent." });
  }
  catch (error) {
    logger.error(error);
    return res.status(500).json({ 
      error: {
        code: 'SERVER_ERROR',
        message: RequestMessage.SERVER_ERROR,
        detail: {}
      }
    });
  }
})


export default router;