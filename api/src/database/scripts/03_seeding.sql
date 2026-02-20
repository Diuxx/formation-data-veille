-- Seed data for tool_types, tools, stacks, and stack_versions
-- MySQL-compatible; run inside the target database

SET NAMES utf8mb4;

-- Clean existing data to avoid duplicates on re-run
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM stack_versions;
DELETE FROM tools;
DELETE FROM tool_types;
DELETE FROM stacks;
SET FOREIGN_KEY_CHECKS = 1;

START TRANSACTION;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Stacks
INSERT INTO stacks (id, name, description, icon)
VALUES
  (gen_random_uuid(), 'Angular', 'Frontend framework for building SPA and enterprise apps.', 'https://angular.io/assets/images/logos/angular/angular.svg'),
  (gen_random_uuid(), 'Node.js', 'JavaScript runtime built on Chrome\'s V8 JavaScript engine.', 'https://nodejs.org/static/images/logo.svg');

-- Tool types
INSERT INTO tool_types (id, name, description)
VALUES
  (gen_random_uuid(), 'IDE', 'Integrated Development Environments'),
  (gen_random_uuid(), 'CI/CD', 'Continuous Integration and Deployment tools'),
  (gen_random_uuid(), 'Testing', 'Unit, integration, e2e testing tools'),
  (gen_random_uuid(), 'Database', 'Database engines and admin tools'),
  (gen_random_uuid(), 'Frontend', 'Frontend tooling and CLIs'),
  (gen_random_uuid(), 'Backend', 'Backend frameworks and runtimes'),
  (gen_random_uuid(), 'Monitoring', 'Observability and monitoring');

-- Tools
-- INSERT INTO tools (id, toolTypeId, name, description, icon, url, isActive)
-- VALUES
--   ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'VS Code', 'Fast, lightweight IDE with rich ecosystem.', 'https://code.visualstudio.com/assets/images/code-stable.png', 'https://code.visualstudio.com/', TRUE),
--   ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'GitHub Actions', 'CI/CD pipelines for GitHub repositories.', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'https://github.com/features/actions', TRUE),
--   ('bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Jest', 'Delightful JavaScript testing framework.', 'https://jestjs.io/img/jest.png', 'https://jestjs.io/', TRUE),
--   ('bbbbbbb4-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'PostgreSQL', 'Advanced open source relational database.', 'https://www.postgresql.org/media/img/about/press/elephant.png', 'https://www.postgresql.org/', TRUE),
--   ('bbbbbbb5-bbbb-bbbb-bbbb-bbbbbbbbbbb5', 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Angular CLI', 'CLI for Angular development workflows.', 'https://angular.io/assets/images/logos/angular/angular.svg', 'https://angular.io/cli', TRUE),
--   ('bbbbbbb6-bbbb-bbbb-bbbb-bbbbbbbbbbb6', 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'Node.js', 'JavaScript runtime for server-side applications.', 'https://nodejs.org/static/images/logo.svg', 'https://nodejs.org/', TRUE),
--   ('bbbbbbb7-bbbb-bbbb-bbbb-bbbbbbbbbbb7', 'aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'Prometheus', 'Monitoring system and time series database.', 'https://prometheus.io/assets/favicons/favicon.ico', 'https://prometheus.io/', TRUE);

COMMIT;
