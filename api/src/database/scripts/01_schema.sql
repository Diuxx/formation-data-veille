CREATE TABLE users (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role ENUM ('USER', 'ADMIN', 'SYSTEM') NOT NULL DEFAULT 'USER',
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME
) COMMENT='Base user entity';

CREATE TABLE sessions (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  userId CHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME NOT NULL,
  userAgent VARCHAR(255),
  ipAddress VARCHAR(255),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE
) COMMENT='Active sessions with expiration and device metadata';

CREATE TABLE tokens (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  userId CHAR(36) NOT NULL,
  type ENUM ('RESET_PASSWORD', 'EMAIL_VERIFICATION', 'API_KEY') NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME NOT NULL,
  CONSTRAINT fk_tokens_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE
) COMMENT='Tokens used for resets, verifications, API access';

CREATE TABLE audit_logs (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  userId CHAR(36),
  action VARCHAR(255) NOT NULL,
  details JSON,
  ipAddress VARCHAR(255),
  type ENUM (
    'USER',
    'SYSTEM',
    'CRON',
    'WEBHOOK',
    'API_INTERNAL',
    'API_EXTERNAL',
    'SCHEDULED_TASK',
    'ANONYMOUS',
    'ADMIN_OVERRIDE'
  ) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE SET NULL
) COMMENT='Tracks all relevant actions and events for security & traceability';

CREATE INDEX idx_sessions_userId ON sessions(userId);
CREATE INDEX idx_tokens_userId ON tokens(userId);
CREATE INDEX idx_audit_userId ON audit_logs(userId);
CREATE INDEX idx_tokens_token ON tokens(token);
