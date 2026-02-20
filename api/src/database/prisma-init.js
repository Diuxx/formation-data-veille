import prisma from './prisma.js';
import logger from '../middlewares/logger.js';
import { addYears } from '../utils/utils.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';


/**
 * Initializes the MariaDB/MySQL database by creating the database if needed
 * and executing the SQL schema script to set up the necessary tables.
 * @returns {Promise<void>} A promise that resolves when the database is initialized.
 */
async function initializeDatabase() {
  const urlStr = process.env.PRISMA_DATABASE_URL;
  if (!urlStr) {
    throw new Error('PRISMA_DATABASE_URL is not set');
  }

  const url = new URL(urlStr);
  const host = url.hostname;
  const port = Number(url.port || 3306);
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = url.pathname.replace(/^\//, '');

  // Connect to server without selecting database
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  try {
    // Check if database exists
    const [rows] = await conn.query('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?', [database]);
    const exists = Array.isArray(rows) && rows.length > 0;

    if (!exists) {
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await conn.query(`USE \`${database}\`;`);

      // Execute schema script on freshly created database
      await execScript(conn, './src/database/scripts/01_schema.sql');
      await execScript(conn, './src/database/scripts/02_tools_stacks.sql');
      await execScript(conn, './src/database/scripts/03_seeding.sql');

      logger.info('Database created and schema applied.');
      
      // Seed initial accounts and system API key
      await seedAccounts();
      await generateSystemApiKey();
      logger.info('Seeding completed.');
    } 
    else {
      await conn.query(`USE \`${database}\`;`);
      logger.info('Database exists. Skipping schema script.');
    }

  }
  catch (error) {
    logger.error('Initialization failed:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

/**
 * 
 * @param {*} connection 
 * @param {*} filePath 
 */
async function execScript(connection, filePath) {
  try {
      const schema = fs.readFileSync(filePath, 'utf8');
      await connection.query(schema);
  } catch (error) {
    logger.error(`Failed to execute script ${filePath}:`, error);
    throw error;
  }
}

/**
 * Seeds the database with initial account data.
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
async function seedAccounts() {

  // throw new Error('Seeding is disabled temporarily.');
  if (process.env.ADMIN_EMAIL === undefined || process.env.ADMIN_PASSWORD === undefined) {
    logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD environment variables are not set. Skipping admin user creation.');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  const now = new Date();
  
  // non usable hash for system accounts.
  const systemPasswordHash = await bcrypt.hash(
    crypto.randomBytes(32).toString("hex"),
    10
  );

  // admin account.
  const admin = await prisma.users.upsert({
    where : { email: adminEmail },
    update: {},
    create: {
      id: uuidv4(),
      email: adminEmail,
      name: 'Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
  });

  // system account.
  const system = await prisma.users.upsert({
    where : { email: 'system@local' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'system@local',
      name: 'System',
      passwordHash: systemPasswordHash,
      role: 'SYSTEM',
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
  });

  const adminCreated = new Date(admin.createdAt).getTime() === now.getTime();
  const systemCreated = new Date(system.createdAt).getTime() === now.getTime();

  // log seeding.
  if (adminCreated || systemCreated) {
    await prisma.auditLogs.create({
      data: {
        id: uuidv4(),
        userId: system?.id ?? null,
        action: "SEED",
        trigger: "SYSTEM",
        ipAddress: '127.0.0.1',
        details: JSON.stringify({
          message: 'Seeded accounts.'
        })
      }
    });
    logger.info('seed accounts: Admin and/or System account created.');
  }
}

/**
 * 
 */
async function generateSystemApiKey() {
  const apiKey = process.env.SYSTEM_API_KEY || crypto.randomBytes(32).toString("hex");
  const now = new Date();

  try {
    const systemUser = await prisma.users.findUnique({
      where: { email: 'system@local' }
    });
  
    if (!systemUser) {
      throw new Error('System user not found. Cannot generate API key.');
    }
  
    await prisma.tokens.create({
      data: {
        id: uuidv4(),
        userId: systemUser.id,
        type: 'API_KEY',
        token: apiKey,
        createdAt: now.toISOString(),
        expiresAt: addYears(now, 80).toISOString(),
      }
    });
  
    logger.info('System API key generated/updated.');
  }
  catch (error) {
    logger.error('Failed to generate system API key:');
    logger.error(error);
    throw error;
  }
}

export { seedAccounts, initializeDatabase };