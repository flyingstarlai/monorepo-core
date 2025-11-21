## Why

Two raw SQL SELECT queries exist in UsersService that read from TC_ACCOUNT_LOGIN. This bypasses TypeORM entity mapping and makes parameterization, portability, and testing harder. The project already defines a LoginHistory entity mapped to the same table. Refactoring to use ORM standardizes data access, improves maintainability and security, and aligns with existing patterns.

## What Changes

- Replace UsersService.getLatestMobileLoginForUser raw SELECT with a TypeORM repository query against LoginHistory using order DESC and take(1)
- Replace UsersService.findLoginHistoryByUserId raw SELECT with a TypeORM repository query using order DESC and take(limit)
- Register LoginHistory in UsersModule TypeOrmModule.forFeature and inject its repository into UsersService
- Preserve behavior: identical fields, ordering (login_at DESC), and limits
- Out of scope: stored procedure calls (EXEC ACM*FACTORY*\*) remain unchanged

## Impact

- Affected specs: users
- Affected code:
  - apps/api/src/users/users.service.ts
  - apps/api/src/users/users.module.ts
  - apps/api/src/mobile-apps/entities/login-history.entity.ts (used, not modified)
- Risks: Low; no schema changes; ORM emits MSSQL TOP for take().
- Rollback: Revert UsersService methods to previous raw query implementations if needed.
