## 1. API Phase

- [x] 1.1 API: Add LoginHistory entity mapping TC_ACCOUNT_LOGIN table
- [x] 1.2 API: Extend MobileAppsService with getLoginHistoryByAppId() method
- [x] 1.3 API: Add GET /mobile-apps/:id/login-history endpoint with pagination
- [x] 1.4 API: Add date range filtering (start_date, end_date query params)
- [x] 1.5 API: Add JwtAuthGuard and role check (admin, manager) to new endpoint
- [x] 1.6 API: Add DTO validation for query parameters (pagination, dates)
- [x] 1.7 API: Unit test service method with various filter combinations
- [x] 1.8 API: e2e test endpoint auth (401/403/200) and data filtering

## 2. Web Phase

- [x] 2.1 Web: Add API client function getLoginHistoryByAppId(appId, filters)
- [x] 2.2 Web: Create route /\_authenticated/apps/$id/login-history with beforeLoad role gate
- [x] 2.3 Web: Build login history table with columns (Username, Success, Failure Reason, Login At, Account ID, App Version, App Module)
- [x] 2.4 Web: Add date range filter component and pagination controls
- [x] 2.5 Web: Add success/failure status indicators and color coding
- [x] 2.6 Web: Update mobile apps overview table to include "View Login History" action button
- [x] 2.7 Web: Add breadcrumb navigation back to apps overview
- [x] 2.8 Web: Add loading states and error handling for API calls

## 3. Database & Performance Phase

- [ ] 3.1 Database: Review TC_ACCOUNT_LOGIN table indexes for app_id and login_at queries
- [ ] 3.2 Database: Create index recommendations if performance issues detected
- [ ] 3.3 Performance: Test query performance with realistic data volumes
- [ ] 3.4 Performance: Add response time monitoring for the new endpoint

## 4. Validation & Testing Phase

- [x] 4.1 openspec validate add-app-login-history --strict
- [x] 4.2 Manual test with sample TC_ACCOUNT_LOGIN rows in dev DB
- [x] 4.3 Test role-based access control (admin/manager access, user denied)
- [x] 4.4 Test date filtering edge cases (invalid dates, future dates, etc.)
- [x] 4.5 Test pagination behavior with large datasets
- [x] 4.6 Verify UI responsiveness and accessibility compliance
