import prisma from '../../../database/prisma.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service class for tools and tool types operations.
 */
export default class ToolsService {
  /**
   * Get all active tool types.
   * @returns A list of tool types.
   */
  static async getToolTypes() {
    return await prisma.$queryRaw`
      SELECT id, name, description, createdAt, updatedAt
      FROM tool_types
      WHERE deletedAt IS NULL
      ORDER BY name ASC
    `;
  }

  /**
   * Create a new tool type.
   * @param {*} payload Tool type data.
   * @returns The created tool type.
   */
  static async createToolType(payload) {
    const id = uuidv4();
    await prisma.$executeRaw`
      INSERT INTO tool_types (id, name, description)
      VALUES (${id}, ${payload.name}, ${payload.description ?? null})
    `;

    const rows = await prisma.$queryRaw`
      SELECT id, name, description, createdAt, updatedAt
      FROM tool_types
      WHERE id = ${id}
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  /**
   * Get all active tools.
   * @returns A list of tools with their type names.
   */
  static async getTools() {
    return await prisma.$queryRaw`
      SELECT
        t.id,
        t.name,
        t.description,
        t.icon,
        t.url,
        t.isActive,
        t.toolTypeId,
        tt.name AS toolTypeName,
        t.createdAt,
        t.updatedAt
      FROM tools t
      INNER JOIN tool_types tt ON tt.id = t.toolTypeId
      WHERE t.deletedAt IS NULL AND tt.deletedAt IS NULL
      ORDER BY t.createdAt DESC
    `;
  }

  /**
   * Get one active tool by ID.
   * @param {*} toolId Tool ID.
   * @returns The tool if found, otherwise null.
   */
  static async getToolById(toolId) {
    const rows = await prisma.$queryRaw`
      SELECT id, toolTypeId, name, description, icon, url, isActive, createdAt, updatedAt
      FROM tools
      WHERE id = ${toolId} AND deletedAt IS NULL
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  /**
   * Create a new tool.
   * @param {*} payload Tool data.
   * @returns The created tool.
   */
  static async createTool(payload) {
    const id = uuidv4();
    const isActive = payload.isActive ?? 1;

    await prisma.$executeRaw`
      INSERT INTO tools (id, toolTypeId, name, description, icon, url, isActive)
      VALUES (
        ${id},
        ${payload.toolTypeId},
        ${payload.name},
        ${payload.description ?? null},
        ${payload.icon ?? null},
        ${payload.url ?? null},
        ${isActive}
      )
    `;

    return await this.getToolById(id);
  }

  /**
   * Update a tool by ID.
   * @param {*} toolId Tool ID.
   * @param {*} payload Tool data to update.
   * @returns The updated tool if found, otherwise null.
   */
  static async updateTool(toolId, payload) {
    const existing = await this.getToolById(toolId);
    if (!existing) {
      return null;
    }

    await prisma.$executeRaw`
      UPDATE tools
      SET
        toolTypeId = ${payload.toolTypeId ?? existing.toolTypeId},
        name = ${payload.name ?? existing.name},
        description = ${payload.description ?? existing.description},
        icon = ${payload.icon ?? existing.icon},
        url = ${payload.url ?? existing.url},
        isActive = ${payload.isActive ?? existing.isActive}
      WHERE id = ${toolId}
    `;

    return await this.getToolById(toolId);
  }

  /**
   * Soft delete a tool by ID.
   * @param {*} toolId Tool ID.
   * @returns The previous tool data if found, otherwise null.
   */
  static async deleteTool(toolId) {
    const existing = await this.getToolById(toolId);
    if (!existing) {
      return null;
    }

    await prisma.$executeRaw`
      UPDATE tools
      SET deletedAt = NOW()
      WHERE id = ${toolId}
    `;

    return existing;
  }
}
