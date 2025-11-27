## ADDED Requirements

### Requirement: App Definition From Google Services

The system SHALL allow admin or manager to create a Mobile App Definition by uploading `google-services.json` and entering display fields.

- The system SHALL parse `package_name` from `client[0].client_info.android_client_info.package_name`.
- The system SHALL derive `APP_ID` as:
  - If `package_name` contains `TCS[0-9]+`, use that match (uppercased),
  - ELSE use the last segment of the package name (text after the final `.`).
- The system SHALL store ONLY the latest `google-services.json` (replacing the previous version) along with derived `packageName`, `APP_ID`, `appName`, `appModule`, and `serverIp`.
- The system SHALL allow updating `appName`, `appModule`, and `serverIp` later; replacing the JSON recomputes `APP_ID`.

#### Scenario: Create definition via upload

- WHEN an admin uploads a valid `google-services.json` and provides `APP_NAME` and optional `APP_MODULE` and `SERVER_IP`
- THEN the system parses the JSON and derives `APP_ID`
- AND the system saves a new App Definition with stored JSON (latest only)
- AND the response returns `id`, `appId`, `packageName`, `appName`, `appModule`, `serverIp`.

#### Scenario: Invalid google-services.json

- WHEN the uploaded file is not valid JSON or does not contain `package_name`
- THEN the system responds with 400 and an error message.

### Requirement: Module Catalog Source

The system SHALL source available `APP_MODULE` values from MSSQL table `TC_DASHBOARD_MODULE`.

- `no` column SHALL map to the parameter value `APP_MODULE`.
- `label` column SHALL be used for display in the UI selection.
- The system SHALL provide an endpoint to list modules (value+label) for the UI to consume.
- The system SHALL validate that any provided `APP_MODULE` exists in this table.

#### Scenario: List modules for selection

- WHEN an admin opens the create/regenerate form
- THEN the UI fetches modules from the API and shows `label` while submitting `no` as `APP_MODULE`.

### Requirement: Trigger Android Build

The system SHALL trigger a Jenkins job to build the Android app using Docker and parameters.

- Parameters: `APP_NAME`, `APP_ID`, `APP_MODULE`, `SERVER_IP`, and a URL to download the definition's `google-services.json`.
- The system SHALL record a Build with status `queued` and store returned Jenkins queue id.
- Version fields SHALL NOT be passed; Jenkins SHALL derive version from source.
- Concurrency: Only one active build system‑wide (`queued` or `building`) SHALL be allowed; any new trigger while a build is active SHALL respond `409 Conflict` and return the active `buildId`.

#### Scenario: Trigger build from existing definition

- GIVEN a saved App Definition
- WHEN an admin/manager triggers a build (optionally overriding `APP_NAME`, `APP_MODULE`, `SERVER_IP`)
- THEN the system calls Jenkins `buildWithParameters`
- AND creates a Build record with `queued` status and `jenkinsQueueId`.

#### Scenario: Concurrent trigger blocked globally

- GIVEN any Build is in `queued` or `building`
- WHEN another trigger is requested (for the same or a different Definition)
- THEN the API responds `409 Conflict` with a payload referencing the active `buildId` and its status.

### Requirement: Build Status Tracking

The system SHALL track Jenkins build status and expose it via API.

- Orchestrator: NestJS Scheduler SHALL run polling loops server‑side (not in the browser). State persists in MSSQL.
- Poll cadence: queue resolution ~2s; build status ~5s; a sweeper job runs every 1–2 minutes to resume polling after restarts.
- The system SHALL poll the Jenkins queue to resolve a `buildNumber` and then poll build info until `SUCCESS` or `FAILURE`.
- The system SHALL map Jenkins results to `success` or `failed` states and update the Build record.
- The system SHOULD store Jenkins console URL if available.

#### Scenario: Build completes successfully

- GIVEN a queued Build
- WHEN Jenkins reports a successful result
- THEN the Build status becomes `success`
- AND the artifact URL is stored and returned by the API.

#### Scenario: Service restarts during build

- GIVEN a Build in `queued` or `building`
- WHEN the API service restarts
- THEN the sweeper resumes polling and the UI can continue by reloading the build detail (status persists).

### Requirement: Artifact Storage And Access

The Jenkins pipeline SHALL upload the APK artifact to MinIO, and artifacts SHALL NOT be publicly readable.

- Bucket path: `android-artifacts/<APP_ID>/<APP_MODULE>/`.
- Artifact filename: `<APP_ID>-<sanitized-APP_NAME>.apk` (ASCII-only sanitization, preserve letters, digits, dot, dash, underscore; replace others with `-`).
- The API SHALL provide a presigned URL (short TTL) or a gated download endpoint; only admin/manager MAY request it.

#### Scenario: Artifact link restricted to admin/manager

- WHEN a build finishes
- THEN the pipeline uploads the APK to MinIO at the specified path
- AND the API stores the artifact location
- AND only admin/manager can request a presigned URL for download (regular users receive 403).

### Requirement: Access Control

Only users with role `admin` or `manager` MAY create/update definitions, trigger builds, and download artifacts.

- Regular users MUST be denied with 403 when attempting these actions.

#### Scenario: Unauthorized user

- WHEN a user without `admin` or `manager` role attempts to create a definition, trigger a build, or download an artifact
- THEN the system responds with 403 Forbidden.

### Requirement: API Surface

The system SHALL provide endpoints for managing definitions, modules, and builds.

- GET `/app-builder/modules` to list module options from `TC_DASHBOARD_MODULE` (`no` as value, `label` as label).
- POST `/app-builder/definitions/upload` (multipart) to create from `google-services.json` with fields `appName`, optional `appModule`, `serverIp`.
- GET `/app-builder/definitions` to list definitions.
- GET `/app-builder/definitions/:id` to get a definition.
- GET `/app-builder/definitions/:id/google-services.json` to download the stored JSON (for Jenkins).
- POST `/app-builder/builds` with `definitionId`, optional overrides for `appName`, `appModule`, `serverIp`.
- GET `/app-builder/builds?definitionId=...` and GET `/app-builder/builds/:id` for status.
- GET `/app-builder/builds/:id/download` returns a presigned URL (admin/manager only).

#### Scenario: List builds for a definition

- WHEN a client fetches builds filtered by `definitionId`
- THEN the system returns builds ordered by time with status and the ability for authorized users to get a presigned download link.

### Requirement: Web UI (Admin/Manager)

The web application SHALL provide pages for App Builder management.

- Definitions page with create (upload json), edit, and trigger build actions.
- Module selector lists labels from `TC_DASHBOARD_MODULE` while submitting the matching `no` value.
- Build dialog shows parameters and current status (queued/building/success/failed); a download button appears only for admin/manager and uses presigned URLs.

#### Scenario: Admin triggers build from UI

- WHEN an admin uploads a new definition and triggers a build
- THEN the UI shows live status and later a download button that requests a presigned URL (admin/manager only).
