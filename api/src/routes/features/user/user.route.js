
import { Router } from 'express';
import { authOrApiKey } from '../../../middlewares/auth/authOrApiKey.js';
import { isAdmin } from '../../../middlewares/isAdmin.js';
import UserService from './user.service.js';
import logger from '../../../middlewares/logger.js';
import { audit } from '../../../middlewares/audit-log/audit-log.js';
import { ActionEvt, RequestMessage } from '../../../utils/utils.js';
import { createUserSchema, updateUserSchema } from './user.schema.js';

const router = Router();

/**
 * GET /
 * 
 * Returns a list of all users.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.get('/', authOrApiKey, isAdmin, audit(ActionEvt.LIST_USERS), async (_req, res, next) => {
  try {
    const users = await UserService.getAll();
    return res.status(200).json({
      data: users,
      count: users.length
    });
  }
  catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /:id
 * 
 * Returns information for a specific user by ID.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.get('/:id', authOrApiKey, isAdmin, audit(ActionEvt.GET_USER), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({
      data: user
    });
  }
  catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /
 * 
 * Creates a new user.
 */
router.post('/', authOrApiKey, isAdmin, audit(ActionEvt.CREATE_USER), async (req, res) => {
  try {
    const result = await createUserSchema.safeParseAsync(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: RequestMessage.INVALID_REQUEST_DATA,
        details: result.error.flatten()
      });
    }

    const user = await UserService.createUser(result.data);
    return res.status(200).json({
      data: user
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

/**
 * PUT /:id
 * 
 * Updates information for a specific user by ID.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.put('/:id', authOrApiKey, isAdmin, audit(ActionEvt.UPDATE_USER), async (req, res) => {
  try {
    // Non blocking schema validation.
    const result = await updateUserSchema.safeParseAsync(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: RequestMessage.INVALID_REQUEST_DATA,
        details: result.error.flatten()
      });
    }

    const user = await UserService.updateUser(req.params.id, result.data);
    return res.status(200).json({
      data: user
    });
  }
  catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

/**
 * DELETE /:id
 * 
 * Deletes a specific user by ID.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.delete('/:id', authOrApiKey, isAdmin, audit(ActionEvt.DELETE_USER), async (req, res) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    return res.status(200).json({
      data: user
    });
  }
  catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;