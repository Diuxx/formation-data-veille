CREATE TABLE IF NOT EXISTS tool_types (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME
) COMMENT='Tool categories/types used by tools catalog';

CREATE TABLE IF NOT EXISTS tools (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  toolTypeId CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(500),
  url VARCHAR(500),
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME,
  CONSTRAINT fk_tools_tool_type
    FOREIGN KEY (toolTypeId) REFERENCES tool_types(id)
    ON DELETE RESTRICT
) COMMENT='List of development tools';

CREATE TABLE IF NOT EXISTS stacks (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(500),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME
) COMMENT='Tech stacks used by projects';

CREATE TABLE IF NOT EXISTS stack_versions (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  stackId CHAR(36) NOT NULL,
  version VARCHAR(100) NOT NULL,
  releaseDate DATE,
  icon VARCHAR(500),
  isLts BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  tags TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME,
  CONSTRAINT fk_stack_versions_stack
    FOREIGN KEY (stackId) REFERENCES stacks(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_stack_version UNIQUE (stackId, version)
) COMMENT='Version history for each stack';

CREATE INDEX idx_tools_toolTypeId ON tools(toolTypeId);
CREATE INDEX idx_tools_isActive ON tools(isActive);
CREATE INDEX idx_stack_versions_stackId ON stack_versions(stackId);
CREATE INDEX idx_stack_versions_releaseDate ON stack_versions(releaseDate);
