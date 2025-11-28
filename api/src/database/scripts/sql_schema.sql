CREATE TABLE `User` (
  `id` uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  `email` varchar(255) UNIQUE NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `name` varchar(255),
  `role` ENUM ('USER', 'ADMIN') NOT NULL DEFAULT (USER),
  `isActive` bool NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL DEFAULT (now()),
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime
);

CREATE TABLE `Session` (
  `id` uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  `userId` uuid NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT (now()),
  `expiresAt` datetime NOT NULL,
  `userAgent` varchar(255),
  `ipAddress` varchar(255)
);

CREATE TABLE `Token` (
  `id` uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  `userId` uuid NOT NULL,
  `type` ENUM ('RESET_PASSWORD', 'EMAIL_VERIFICATION', 'API_KEY') NOT NULL,
  `token` varchar(255) UNIQUE NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT (now()),
  `expiresAt` datetime NOT NULL
);

CREATE TABLE `AuditLog` (
  `id` uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  `userId` uuid,
  `action` varchar(255) NOT NULL,
  `details` json,
  `ipAddress` varchar(255),
  `trigger` ENUM ('USER', 'SYSTEM', 'CRON', 'WEBHOOK', 'API_INTERNAL', 'API_EXTERNAL', 'SCHEDULED_TASK', 'ANONYMOUS', 'ADMIN_OVERRIDE') NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT (now())
);

ALTER TABLE `User` COMMENT = 'Base user entity';

ALTER TABLE `Session` COMMENT = 'Active sessions with expiration and device metadata';

ALTER TABLE `Token` COMMENT = 'Tokens used for resets, verifications, API access';

ALTER TABLE `AuditLog` COMMENT = 'Tracks all relevant actions and events for security & traceability';

ALTER TABLE `Session` ADD FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE;

ALTER TABLE `Token` ADD FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE;

ALTER TABLE `AuditLog` ADD FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL;
