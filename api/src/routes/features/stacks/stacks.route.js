import { Router } from 'express';
import logger from '../../../middlewares/logger.js';
import { authOrApiKey } from '../../../middlewares/auth/authOrApiKey.js';
import { isAdmin } from '../../../middlewares/isAdmin.js';
import StacksService from './stacks.service.js';
import { createStackSchema, createStackVersionSchema, updateStackVersionSchema } from './stacks.schema.js';
import { RequestMessage } from '../../../utils/utils.js';

const router = Router();

/**
 * GET /
 *
 * Returns all stacks.
 * Requires authentication via session or API key.
 */
router.get('/', async (_req, res) => {
  try {
    const data = await StacksService.getStacks();
    
    return res.status(200).json({ data, count: data.length });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * POST /
 *
 * Creates a new stack.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.post('/', authOrApiKey, isAdmin, async (req, res) => {
  try {
    const parsed = await createStackSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: RequestMessage.INVALID_REQUEST_DATA, details: parsed.error.flatten() });
    }

    const data = await StacksService.createStack(parsed.data);
    return res.status(201).json({ data });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * GET /:id/versions
 *
 * Returns all versions for a stack.
 * Requires authentication via session or API key.
 */
router.get('/:id/versions', async (req, res) => {
  try {
    const stack = await StacksService.getStackById(req.params.id);
    if (!stack) {
      return res.status(404).json({ error: 'Stack not found' });
    }

    const data = await StacksService.getStackVersions(req.params.id);
    return res.status(200).json({ data, count: data.length });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * POST /:id/versions
 *
 * Creates a new version for a stack.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.post('/:id/versions', authOrApiKey, isAdmin, async (req, res) => {
  try {
    const stack = await StacksService.getStackById(req.params.id);
    if (!stack) {
      return res.status(404).json({ error: 'Stack not found' });
    }

    const parsed = await createStackVersionSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: RequestMessage.INVALID_REQUEST_DATA, details: parsed.error.flatten() });
    }

    const data = await StacksService.createVersion(req.params.id, parsed.data);
    return res.status(201).json({ data });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * PUT /versions/:versionId
 *
 * Updates one stack version by ID.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.put('/versions/:versionId', authOrApiKey, isAdmin, async (req, res) => {
  try {
    const parsed = await updateStackVersionSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: RequestMessage.INVALID_REQUEST_DATA, details: parsed.error.flatten() });
    }

    const data = await StacksService.updateVersion(req.params.versionId, parsed.data);
    if (!data) {
      return res.status(404).json({ error: 'Version not found' });
    }

    return res.status(200).json({ data });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * DELETE /versions/:versionId
 *
 * Soft deletes one stack version by ID.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.delete('/versions/:versionId', authOrApiKey, isAdmin, async (req, res) => {
  try {
    const data = await StacksService.deleteVersion(req.params.versionId);
    if (!data) {
      return res.status(404).json({ error: 'Version not found' });
    }

    return res.status(200).json({ data });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

export default router;
