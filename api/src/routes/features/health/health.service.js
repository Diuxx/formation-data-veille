import prisma from '../../../database/prisma.js';
import logger from '../../../middlewares/logger.js';

/**
 * Returns the health status of the database connection.
 * @returns {Promise<boolean>} - A promise that resolves to true if the database is healthy, false otherwise.
 */
export async function getDatabaseHealth() {
  try {
    const dbCheck = await prisma.$queryRaw`select 1`;
    return dbCheck !== undefined;
  }
  catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}