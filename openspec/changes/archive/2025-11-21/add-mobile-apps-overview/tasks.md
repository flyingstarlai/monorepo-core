## 1. API Phase

- [x] 1.1 API: Create MobileApp entity mapping TC_APP_USER (MSSQL)
- [x] 1.2 API: Add MobileAppsModule with service and controller
- [x] 1.3 API: Implement GET /mobile-apps returning aggregated list (group by app_name, app_id)
- [x] 1.4 API: Add JwtAuthGuard and role check (admin, manager) to controller handler
- [x] 1.5 API: Unit test service aggregation (version selection and counts)
- [x] 1.6 API: e2e test endpoint auth (401/403/200 basic)

## 2. Web Phase

- [x] 2.1 Web: Add API client function getMobileAppsOverview()
- [x] 2.2 Web: Create route /\_authenticated/apps.tsx with beforeLoad role gate (admin, manager)
- [x] 2.3 Web: Build table UI with columns (App Name, App ID, Latest Version, Active Devices, Total Devices, Unique Users)
- [x] 2.4 Web: Add sidebar item linking to /apps visible to admin and manager
- [x] 2.5 Web: Smoke test navigation and auth redirects
- [x] 2.6 Web: Docs: Brief README note if needed (optional)

## 2. Validation

- [x] 2.1 openspec validate add-mobile-apps-overview --strict
- [x] 2.2 Manual test with sample TC_APP_USER rows in dev DB
