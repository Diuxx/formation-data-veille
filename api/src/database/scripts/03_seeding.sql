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

-- Stacks
INSERT INTO stacks (id, name, description, icon)
VALUES
  (UUID(), 'Angular', 'Frontend framework for building SPA and enterprise apps.', 'https://angular.io/assets/images/logos/angular/angular.svg'),
  (UUID(), 'Node.js', 'JavaScript runtime built on Chrome\'s V8 JavaScript engine.', 'https://nodejs.org/static/images/logo.svg');

-- Tool types
INSERT INTO tool_types (id, name, description)
VALUES
  (UUID(), 'IDE', 'Integrated Development Environments'),
  (UUID(), 'CI/CD', 'Continuous Integration and Deployment tools'),
  (UUID(), 'Testing', 'Unit, integration, e2e testing tools'),
  (UUID(), 'Database', 'Database engines and admin tools'),
  (UUID(), 'Frontend', 'Frontend tooling and CLIs'),
  (UUID(), 'Backend', 'Backend frameworks and runtimes'),
  (UUID(), 'Monitoring', 'Observability and monitoring');
