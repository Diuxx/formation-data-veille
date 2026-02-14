import prisma from '../../../database/prisma.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service class for stacks and stack versions operations.
 */
export default class StacksService {
  /**
   * Get all active stacks.
   * @returns A list of stacks with versions count.
   */
  static async getStacks() {
    return await prisma.$queryRaw`
      SELECT
        s.id,
        s.name,
        s.description,
        s.icon,
        s.createdAt,
        s.updatedAt,
        COUNT(sv.id) AS versionsCount
      FROM stacks s
      LEFT JOIN stack_versions sv ON sv.stackId = s.id AND sv.deletedAt IS NULL
      WHERE s.deletedAt IS NULL
      GROUP BY s.id, s.name, s.description, s.icon, s.createdAt, s.updatedAt
      ORDER BY s.name ASC
    `;
  }

  /**
   * Get one active stack by ID.
   * @param {*} stackId Stack ID.
   * @returns The stack if found, otherwise null.
   */
  static async getStackById(stackId) {
    const rows = await prisma.$queryRaw`
      SELECT id, name, description, icon, createdAt, updatedAt
      FROM stacks
      WHERE id = ${stackId} AND deletedAt IS NULL
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  /**
   * Create a new stack.
   * @param {*} payload Stack data.
   * @returns The created stack.
   */
  static async createStack(payload) {
    const id = uuidv4();

    await prisma.$executeRaw`
      INSERT INTO stacks (id, name, description, icon)
      VALUES (${id}, ${payload.name}, ${payload.description ?? null}, ${payload.icon ?? null})
    `;

    return await this.getStackById(id);
  }

  /**
   * Get all active versions for a stack.
   * @param {*} stackId Stack ID.
   * @returns A list of versions.
   */
  static async getStackVersions(stackId) {
    return await prisma.$queryRaw`
      SELECT id, stackId, version, releaseDate, isLts, notes, createdAt, updatedAt
      FROM stack_versions
      WHERE stackId = ${stackId} AND deletedAt IS NULL
      ORDER BY releaseDate DESC, createdAt DESC
    `;
  }

  /**
   * Get one active version by ID.
   * @param {*} versionId Version ID.
   * @returns The version if found, otherwise null.
   */
  static async getVersionById(versionId) {
    const rows = await prisma.$queryRaw`
      SELECT id, stackId, version, releaseDate, isLts, notes, createdAt, updatedAt
      FROM stack_versions
      WHERE id = ${versionId} AND deletedAt IS NULL
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  /**
   * Create one stack version.
   * @param {*} stackId Stack ID.
   * @param {*} payload Version data.
   * @returns The created version.
   */
  static async createVersion(stackId, payload) {
    const id = uuidv4();
    const isLts = payload.isLts ?? 0;

    await prisma.$executeRaw`
      INSERT INTO stack_versions (id, stackId, version, releaseDate, isLts, notes)
      VALUES (
        ${id},
        ${stackId},
        ${payload.version},
        ${payload.releaseDate ?? null},
        ${isLts},
        ${payload.notes ?? null}
      )
    `;

    return await this.getVersionById(id);
  }

  /**
   * Update one stack version by ID.
   * @param {*} versionId Version ID.
   * @param {*} payload Version data to update.
   * @returns The updated version if found, otherwise null.
   */
  static async updateVersion(versionId, payload) {
    const existing = await this.getVersionById(versionId);
    if (!existing) {
      return null;
    }

    await prisma.$executeRaw`
      UPDATE stack_versions
      SET
        version = ${payload.version ?? existing.version},
        releaseDate = ${payload.releaseDate ?? existing.releaseDate},
        isLts = ${payload.isLts ?? existing.isLts},
        notes = ${payload.notes ?? existing.notes}
      WHERE id = ${versionId}
    `;

    return await this.getVersionById(versionId);
  }

  /**
   * Soft delete one stack version by ID.
   * @param {*} versionId Version ID.
   * @returns The previous version data if found, otherwise null.
   */
  static async deleteVersion(versionId) {
    const existing = await this.getVersionById(versionId);
    if (!existing) {
      return null;
    }

    await prisma.$executeRaw`
      UPDATE stack_versions
      SET deletedAt = NOW()
      WHERE id = ${versionId}
    `;

    return existing;
  }
}
