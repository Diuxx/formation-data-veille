PRAGMA foreign_keys = ON;

CREATE TABLE "User" (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK(role IN ('USER','ADMIN', 'SYSTEM')) DEFAULT 'USER',
  isActive INTEGER NOT NULL DEFAULT 1 CHECK (isActive IN (0, 1)),
  createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updatedAt TEXT NOT NULL,
  deletedAt TEXT
);

CREATE TABLE "Session" (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  expiresAt TEXT NOT NULL,
  userAgent TEXT,
  ipAddress TEXT,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE "Token" (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('RESET_PASSWORD','EMAIL_VERIFICATION','API_KEY')),
  token TEXT UNIQUE NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  expiresAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE "AuditLog" (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ipAddress TEXT,
  trigger TEXT NOT NULL CHECK (
      trigger IN (
        'USER',
        'SYSTEM',
        'CRON',
        'WEBHOOK',
        'API_INTERNAL',
        'API_EXTERNAL',
        'SCHEDULED_TASK',
        'ANONYMOUS',
        'ADMIN_OVERRIDE'
      )
  ),
  createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
);
