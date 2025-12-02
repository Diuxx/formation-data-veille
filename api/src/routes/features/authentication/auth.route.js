
import { Router } from 'express';
import { ActionEvt, RequestMessage } from '../../../utils/utils.js';
import { audit } from '../../../middlewares/audit-log/audit-log.js';
import logger from '../../../middlewares/logger.js';
import { loginSchema } from './auth.schema.js'
import AuthService from './auth.service.js';


const router = Router();

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
  
    // Authentication logic here
    res.status(200).json({ 
      message: 'Login successful',
      data: auth
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
router.post('/logout', async (req, res) => {
  // Logout logic here
  res.status(200).json({ message: 'Logout successful' });
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
    return res.status(201).json({
      data: user
    });
  } 
  catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }


  // Registration logic here
  res.status(201).json({ message: 'Registration successful' });
});



export default router;