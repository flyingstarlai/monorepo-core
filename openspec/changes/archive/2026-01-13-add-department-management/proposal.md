## Why

User creation and analytics currently depend on a SQL Server stored procedure (`ACM_FACTORY_DEPT`) to list available departments. This tight coupling makes it harder to evolve department structure, adds hidden dependencies outside the ORM model, and prevents admins from managing departments directly from the web UI. We also want a single, canonical `Department` model that can be reused across user management and dashboard statistics.

## What Changes

- Add a `Department` TypeORM entity mapped to the existing `TC_APP_DEPT` table, including hierarchy (`parent_dept_no`), level, manager, active flag, and timestamps.
- Introduce a Department management API (NestJS) and service in the Users domain to list, create, update, and toggle active departments via ORM instead of stored procedures.
- Add a new "Departments" submenu under the Users section in the web sidebar, with a simple CRUD UI for managing available departments; only `admin` and `manager` roles may access this page.
- Replace the `ACM_FACTORY_DEPT` stored procedure usage in the user creation flow with a TypeORM-based query against `Department`, ensuring the create-user form pulls from active departments only.
- Keep existing user records and dashboard department counts working, using the new Department model as the canonical source of department metadata going forward.

## Impact

- Affected specs: users.
- Affected code:
  - API: Users domain (new `Department` entity, repository/service, controller endpoints, role guards, replacement of `ACM_FACTORY_DEPT` for department lists).
  - Core/TypeORM: Entity registration so other services (e.g., dashboard) can reuse departments via ORM.
  - Web: Users feature (new Departments management page and sidebar submenu, create-user form updated to consume the Department-based API instead of the stored procedure-backed endpoint).
- Database:
  - Uses existing `TC_APP_DEPT` table; no schema changes required.
  - `active` flag on `TC_APP_DEPT` becomes the source of truth for which departments are selectable when creating users.
- Breaking risk:
  - Low, provided the new Department-based list returns the same or a superset of departments compared to `ACM_FACTORY_DEPT`. Rollback path is to temporarily point the API back to the stored procedure call if needed.
