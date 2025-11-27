## 1. API Implementation

- [x] 1.1 Database tables: MobileAppDefinition, MobileAppBuild (MSSQL, TypeORM)
- [x] 1.2 Module Catalog API: read MSSQL table `TC_DASHBOARD_MODULE` and expose `GET /mobile-app-builder/modules` (value=`no`, label=`label`); validate APP_MODULE
- [ ] 1.3 Global Google Services
  - [ ] 1.3.1 `POST /mobile-app-builder/google-services` (upload a single global google-services.json, store latest only)
  - [ ] 1.3.2 `GET /mobile-app-builder/app-ids` (derive list of APP_ID from stored google-services.json; prefer `TCS[0-9]+`, else last segment of package_name)
- [ ] 1.4 Mobile App Builder Endpoints (RBAC: admin/manager)
  - [ ] 1.4.1 CRUD definitions (no per-definition google-services upload)
  - [ ] 1.4.2 Trigger build
  - [ ] 1.4.3 List builds, get status
  - [ ] 1.4.4 Presigned download endpoint
- [x] 1.5 Jenkins integration service (env-based config, crumb support) and polling; do not pass version params
- [ ] 1.6 Jenkins CI pipeline (Docker-based Android image) and MinIO upload step; print artifact location
- [x] 1.7 CI stack: docker-compose.ci.yml for Jenkins + DinD + MinIO (bucket private by default)
- [x] 1.8 RBAC and server-side validation (APP_MODULE exists in `TC_DASHBOARD_MODULE`)
- [x] 1.9 Tests: unit (parser, module service), e2e (permissions, presigned download), smoke (Jenkins trigger mocked)
- [x] 1.10 Documentation: .env.example additions and Jenkins/MinIO setup notes

## 2. Web Implementation

- [x] 2.1 Web UI base: Definitions list, create/edit, trigger build dialog, build history, admin/manager-only download (presigned)
- [ ] 2.2 New page/route: Upload global google-services.json and preview parsed APP_ID list
- [ ] 2.3 Create Definition form: APP_ID as dropdown from `GET /mobile-app-builder/app-ids` (no free text, no file upload)
- [ ] 2.4 Module selector: fetch from API `GET /mobile-app-builder/modules` (no hardcoded values)
- [x] 2.5 UI role enforcement (admin/manager) and validation rules (SERVER_IP free text)

## 3. Validation

- [x] 3.1 Permissions: non-admin/manager cannot create, trigger, or download artifacts (UI enforcement implemented)
- [x] 3.2 APP_ID extraction matches TCS pattern or last segment fallback (form validation implemented)

## 4. Frontend Type System & Build Fixes (Completed ✅)

- [x] 4.1 Updated MobileAppDefinition interface to match database schema (appName, appId, appModule, serverIp, googleServicesContent)
- [x] 4.2 Updated MobileAppBuild interface with missing properties (jenkinsQueueId, jenkinsBuildNumber, artifactPath, consoleUrl, errorMessage, startedAt, completedAt)
- [x] 4.3 Fixed status enum to match database: 'queued' | 'building' | 'completed' | 'failed' | 'cancelled'
- [x] 4.4 Updated request interfaces (CreateDefinitionRequest, UpdateDefinitionRequest) to match database fields
- [x] 4.5 Fixed import statements to use type-only imports where required
- [x] 4.6 Updated Create Definition Dialog form with appId field and proper validation
- [x] 4.7 Updated Edit Definition Dialog with appId field and correct property mapping
- [x] 4.8 Fixed Definition List component property access (googleServicesContent check instead of hasGoogleServices)
- [x] 4.9 Updated Build History Dialog with correct status handling and download response properties
- [x] 4.10 Added missing getDefinition method to service layer
- [x] 4.11 Fixed hook implementation and removed dynamic import inconsistencies
- [x] 4.12 Resolved all TypeScript compilation errors and lint warnings
- [x] 4.13 Verified both API and web builds pass with zero errors
