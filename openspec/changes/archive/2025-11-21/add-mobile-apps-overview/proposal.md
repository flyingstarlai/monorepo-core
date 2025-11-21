## Why

Admins and managers need a central place to see which mobile apps are currently connected to our system for support, auditing, and rollout coordination. We already capture mobile app registrations in the MSSQL table TC_APP_USER; surfacing this data via an API and protected UI enables visibility without ad‑hoc queries.

## What Changes

- API: Add read-only endpoint to list connected mobile apps aggregated from TC_APP_USER
- Security: Protect endpoint with JWT and restrict access to roles admin and manager
- Web: Add a new protected route /mobile-apps showing the aggregated list in a table
- Navigation: Add a sidebar item linking to /mobile-apps visible to admin and manager only
- No schema changes: Read-only against existing TC_APP_USER (MSSQL)

## Impact

- Affected specs: mobile-apps
- Affected code:
  - apps/api: new module (controller/service/entity mapping to TC_APP_USER)
  - apps/web: new route under \_authenticated, API client call, table UI
  - apps/web: sidebar update for new navigation item
- Performance: Simple grouped query over TC_APP_USER; add sensible index guidance if needed (non-blocking)
- Security: JWT required; role-gated to admin and manager; no data mutation
