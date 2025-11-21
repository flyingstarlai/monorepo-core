## Why

Admins and managers need to track and audit login activity for specific mobile apps to monitor security, identify suspicious patterns, and understand user engagement. The system already captures login data in TC_ACCOUNT_LOGIN table; exposing this via a filtered API endpoint and UI will provide actionable insights for app-specific security monitoring.

## What Changes

- API: Add new endpoint GET /mobile-apps/:id/login-history to fetch login records filtered by app_id
- Database: Query existing TC_ACCOUNT_LOGIN table (no schema changes needed)
- Security: Protect endpoint with JWT and restrict access to roles admin and manager
- Web: Add login history view accessible from mobile apps overview page
- Filtering: Support date range filtering and pagination for large datasets
- UI: Show login success/failure patterns, failure reasons, and user activity trends

## Impact

- Affected specs: mobile-apps (extending existing capability)
- Affected code:
  - apps/api: extend MobileAppsController and MobileAppsService with login history endpoint
  - apps/web: add login history route, API client, and table UI with filtering
  - apps/web: update mobile apps overview to include "View Login History" action
- Performance: Add proper indexing recommendations for TC_ACCOUNT_LOGIN.app_id and login_at columns
- Security: JWT required; role-gated to admin and manager; read-only access to existing data
