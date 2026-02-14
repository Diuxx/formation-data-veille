import { Router } from 'express';
import logger from '../../../middlewares/logger.js';
import { authOrApiKey } from '../../../middlewares/auth/authOrApiKey.js';
import { isAdmin } from '../../../middlewares/isAdmin.js';
import ToolsService from './tools.service.js';
import { createToolSchema, createToolTypeSchema, updateToolSchema } from './tools.schema.js';
import { RequestMessage } from '../../../utils/utils.js';

const router = Router();

/**
 * GET /types
 *
 * Returns all tool types.
 * Requires authentication via session or API key.
 */
router.get('/types', authOrApiKey, async (_req, res) => {
  try {
    const data = await ToolsService.getToolTypes();
    return res.status(200).json({ data, count: data.length });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * POST /types
 *
 * Creates a new tool type.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.post('/types', authOrApiKey, isAdmin, async (req, res) => {
  try {
    const parsed = await createToolTypeSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: RequestMessage.INVALID_REQUEST_DATA, details: parsed.error.flatten() });
    }

    const data = await ToolsService.createToolType(parsed.data);
    return res.status(201).json({ data });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * GET /
 *
 * Returns all tools.
 * Requires authentication via session or API key.
 */
router.get('/', authOrApiKey, async (_req, res) => {
  try {
    const data = await ToolsService.getTools();
    return res.status(200).json({ data, count: data.length });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * POST /
 *
 * Creates a new tool.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.post('/', authOrApiKey, isAdmin, async (req, res) => {
  try {
    const parsed = await createToolSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: RequestMessage.INVALID_REQUEST_DATA, details: parsed.error.flatten() });
    }

    const data = await ToolsService.createTool(parsed.data);
    return res.status(201).json({ data });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * PUT /:id
 *
 * Updates a tool by ID.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.put('/:id', authOrApiKey, isAdmin, async (req, res) => {
  try {
    const parsed = await updateToolSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: RequestMessage.INVALID_REQUEST_DATA, details: parsed.error.flatten() });
    }

    const data = await ToolsService.updateTool(req.params.id, parsed.data);
    if (!data) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    return res.status(200).json({ data });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

/**
 * DELETE /:id
 *
 * Soft deletes a tool by ID.
 * Requires authentication via session or API key.
 * Requires admin privileges.
 */
router.delete('/:id', authOrApiKey, isAdmin, async (req, res) => {
  try {
    const data = await ToolsService.deleteTool(req.params.id);
    if (!data) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    return res.status(200).json({ data });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: RequestMessage.SERVER_ERROR });
  }
});

export default router;
