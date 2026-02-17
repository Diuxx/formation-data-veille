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

-- Stacks
INSERT INTO stacks (id, name, description, icon)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Angular', 'Frontend framework for building SPA and enterprise apps.', 'https://angular.io/assets/images/logos/angular/angular.svg'),
  ('22222222-2222-2222-2222-222222222222', 'Node.js', 'JavaScript runtime built on Chrome\'s V8 JavaScript engine.', 'https://nodejs.org/static/images/logo.svg'),
  ('33333333-3333-3333-3333-333333333333', 'PostgreSQL', 'Powerful, open source object-relational database system.', 'https://www.postgresql.org/media/img/about/press/elephant.png');

-- Stack versions
INSERT INTO stack_versions (id, stackId, version, releaseDate, icon, isLts, notes, tags)
VALUES
  ('11111111-aaaa-bbbb-cccc-000000000001', '11111111-1111-1111-1111-111111111111', '17.3.0', '2025-11-15', 'https://angular.io/assets/images/logos/angular/angular.svg', FALSE, 'Latest minor in Angular 17 stream.', 'framework,spa,typescript'),
  ('11111111-aaaa-bbbb-cccc-000000000002', '11111111-1111-1111-1111-111111111111', '16.2.12', '2024-06-20', 'https://angular.io/assets/images/logos/angular/angular.svg', TRUE, 'Stable LTS maintenance release.', 'lts,framework'),
  ('22222222-aaaa-bbbb-cccc-000000000001', '22222222-2222-2222-2222-222222222222', '20.11.1', '2025-12-10', 'https://nodejs.org/static/images/logo.svg', TRUE, 'Node.js 20 LTS (Iron).', 'runtime,lts'),
  ('22222222-aaaa-bbbb-cccc-000000000002', '22222222-2222-2222-2222-222222222222', '18.19.0', '2024-04-23', 'https://nodejs.org/static/images/logo.svg', TRUE, 'Node.js 18 LTS (Hydrogen).', 'runtime,lts'),
  ('33333333-aaaa-bbbb-cccc-000000000001', '33333333-3333-3333-3333-333333333333', '16.3', '2025-10-05', 'https://www.postgresql.org/media/img/about/press/elephant.png', TRUE, 'PostgreSQL 16 stable branch.', 'database,sql,lts'),
  ('33333333-aaaa-bbbb-cccc-000000000002', '33333333-3333-3333-3333-333333333333', '15.6', '2024-03-12', 'https://www.postgresql.org/media/img/about/press/elephant.png', TRUE, 'PostgreSQL 15 stable branch.', 'database,sql');

-- Tool types
INSERT INTO tool_types (id, name, description)
VALUES
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'IDE', 'Integrated Development Environments'),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'CI/CD', 'Continuous Integration and Deployment tools'),
  ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Testing', 'Unit, integration, e2e testing tools'),
  ('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Database', 'Database engines and admin tools'),
  ('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Frontend', 'Frontend tooling and CLIs'),
  ('aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'Backend', 'Backend frameworks and runtimes'),
  ('aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'Monitoring', 'Observability and monitoring');

-- Tools
INSERT INTO tools (id, toolTypeId, name, description, icon, url, isActive)
VALUES
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'VS Code', 'Fast, lightweight IDE with rich ecosystem.', 'https://code.visualstudio.com/assets/images/code-stable.png', 'https://code.visualstudio.com/', TRUE),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'GitHub Actions', 'CI/CD pipelines for GitHub repositories.', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'https://github.com/features/actions', TRUE),
  ('bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Jest', 'Delightful JavaScript testing framework.', 'https://jestjs.io/img/jest.png', 'https://jestjs.io/', TRUE),
  ('bbbbbbb4-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'PostgreSQL', 'Advanced open source relational database.', 'https://www.postgresql.org/media/img/about/press/elephant.png', 'https://www.postgresql.org/', TRUE),
  ('bbbbbbb5-bbbb-bbbb-bbbb-bbbbbbbbbbb5', 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Angular CLI', 'CLI for Angular development workflows.', 'https://angular.io/assets/images/logos/angular/angular.svg', 'https://angular.io/cli', TRUE),
  ('bbbbbbb6-bbbb-bbbb-bbbb-bbbbbbbbbbb6', 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'Node.js', 'JavaScript runtime for server-side applications.', 'https://nodejs.org/static/images/logo.svg', 'https://nodejs.org/', TRUE),
  ('bbbbbbb7-bbbb-bbbb-bbbb-bbbbbbbbbbb7', 'aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'Prometheus', 'Monitoring system and time series database.', 'https://prometheus.io/assets/favicons/favicon.ico', 'https://prometheus.io/', TRUE);

COMMIT;
