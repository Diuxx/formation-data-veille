Enum Role {
  USER
  ADMIN
}

Enum TokenType {
  RESET_PASSWORD
  EMAIL_VERIFICATION
  API_KEY
}

enum TriggerType {
  USER                // action faite par un utilisateur identifié
  SYSTEM              // action interne non humaine
  CRON                // tâche planifiée
  WEBHOOK             // événement provenant d'un service externe
  API_INTERNAL        // appel interne entre microservices
  API_EXTERNAL        // appel venant d’un client ou intégration externe
  SCHEDULED_TASK      // tâche programmée par un scheduler
  ANONYMOUS           // action sans user (ex: visiteur, invité)
  ADMIN_OVERRIDE      // action privilégiée, opérée en bypass
}

Table User {
  id           uuid      [pk, not null, default: `uuid_generate_v4()`]
  email        varchar   [unique, not null]
  passwordHash varchar   [not null]
  name         varchar
  role         Role      [not null, default: `USER`]
  isActive     bool      [not null, default: 1]
  createdAt    datetime  [not null, default: `now()`]
  updatedAt    datetime  [not null]
  deletedAt    datetime
  Note: 'Base user entity'
}

Table Session {
  id          uuid      [pk, not null, default: `uuid_generate_v4()`]
  userId      uuid      [not null]
  createdAt   datetime  [not null, default: `now()`]
  expiresAt   datetime  [not null]
  userAgent   varchar
  ipAddress   varchar

  Note: 'Active sessions with expiration and device metadata'
}

Table Token {
  id          uuid       [pk, not null, default: `uuid_generate_v4()`]
  userId      uuid       [not null]
  type        TokenType  [not null]
  token       varchar    [unique, not null]
  createdAt   datetime   [not null, default: `now()`]
  expiresAt   datetime   [not null]

  Note: 'Tokens used for resets, verifications, API access'
}

Table AuditLog {
  id          uuid      [pk, not null, default: `uuid_generate_v4()`]
  userId      uuid
  action      varchar     [not null]
  details     json
  ipAddress   varchar
  trigger     TriggerType [not null]
  createdAt   datetime  [not null, default: `now()`]

  Note: 'Tracks all relevant actions and events for security & traceability'
}

Ref: Session.userId > User.id [delete: cascade]
Ref: Token.userId   > User.id [delete: cascade]
Ref: AuditLog.userId > User.id [delete: set null]
