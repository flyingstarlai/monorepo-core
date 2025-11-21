## Why

Current module structure has entity cross-dependencies and circular dependency risks. LoginHistory entity is in mobile-apps domain but used by users domain, creating tight coupling. MobileAppsModule directly accesses entities from other modules, violating domain boundaries. This creates maintenance challenges and limits scalability.

## What Changes

- Move LoginHistory entity from mobile-apps to users domain (user-centric data ownership)
- Create CoreModule for centralized entity registration and shared access
- Implement dependency inversion with IUsersService interface
- Resolve circular dependencies using forwardRef pattern
- Update all module imports to respect domain boundaries
- Preserve all existing functionality and API contracts

## Impact

- Affected specs: users, mobile-apps
- Affected code: users.module.ts, mobile-apps.module.ts, auth.module.ts, dashboard.module.ts, app.module.ts, core/ (new)
- Risks: Low; no API changes, only internal architecture
- Rollback: Revert entity locations and module imports if needed
