import prisma from './prisma.js';
import logger from '../middlewares/logger.js';
import { addYears } from '../utils/utils.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';


/**
 * Initializes the SQLite database by creating the database file (if it doesn't exist)
 * and executing the schema SQL script to set up the necessary tables.
 * @returns {Promise<void>} A promise that resolves when the database is initialized.
 */
async function initializeDatabase() {

  const dbPath = path.resolve(process.env.DATABASE_URL);;
  const dir = path.dirname(dbPath);

  // create directory if not exists.
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    logger.info('Database file already exists. Skipping initialization.');
    return;
  }

  const db = new Database(dbPath);

  // execute schema script.
  const schema = fs.readFileSync('./src/database/scripts/sqlite_schema.sql', 'utf8');
  db.exec(schema);
  db.close();

  // Seed initial accounts
  try {
    await seedAccounts();
    await generateSystemApiKey();

    logger.info('Database initialized and seeded.');
  }
  catch (error) {
    logger.error('Seeding failed during initialization:', error);

    // Clean up corrupted DB
    fs.rmSync(dbPath, { force: true });
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
  const admin = await prisma.user.upsert({
    where : { email: adminEmail },
    update: {},
    create: {
      id: uuidv4(),
      email: adminEmail,
      name: 'Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
  });

  // system account.
  const system = await prisma.user.upsert({
    where : { email: 'system@local' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'system@local',
      name: 'System',
      passwordHash: systemPasswordHash,
      role: 'SYSTEM',
      isActive: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
  });

  const adminCreated = new Date(admin.createdAt).getTime() === now.getTime();
  const systemCreated = new Date(system.createdAt).getTime() === now.getTime();

  // log seeding.
  if (adminCreated || systemCreated) {
    await prisma.auditLog.create({
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
    const systemUser = await prisma.user.findUnique({
      where: { email: 'system@local' }
    });
  
    if (!systemUser) {
      throw new Error('System user not found. Cannot generate API key.');
    }
  
    await prisma.token.create({
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