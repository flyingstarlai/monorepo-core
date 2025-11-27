## Why

Admins and managers need a self‑serve way to generate Android application builds with consistent parameters and track results. Builds must run in Jenkins (Docker‑based), store APK artifacts in MinIO, and derive APP_ID from the uploaded google‑services.json to avoid manual errors.

## What Changes

- Add an "Android Mobile App Builder" capability for creating app definitions from google‑services.json and triggering parameterized builds.
- Introduce CI/CD stack (Jenkins + DinD) and MinIO artifact storage, runnable via docker compose.
- Provide API endpoints to upload/manage a single global google‑services.json (store latest only, shared across the whole web app), derive and expose the list of available APP_IDs for selection, trigger builds, list build history, and return presigned download links.
- Add role‑based access: only admin or manager can create/regenerate builds and download artifacts (regular users cannot download).
- Artifact naming: APK saved as `APP_ID-<sanitized-APP_NAME>.apk` and uploaded to MinIO under bucket `android-artifacts/<APP_ID>/<APP_MODULE>/`.
- APP_MODULE selection backed by existing MSSQL table `TC_DASHBOARD_MODULE`; map column `no` → `APP_MODULE`, display `label` in UI; the Web UI must fetch this list from the API (no hardcoded values).
- Versioning is derived by Jenkins from the source; no version params in the API/UI.

## Impact

- Affected specs: app-builder, cicd (jenkins + minio)
- Affected code: API (NestJS) new module; minimal Web UI pages; DevOps (docker compose + Jenkinsfile pipeline)
- External services: Jenkins, MinIO, MSSQL (read `TC_DASHBOARD_MODULE`)

## Decisions (from stakeholder reply)

- Artifact downloads restricted to admin/manager only.
- Jenkins derives version info from source (no version params in UI/API).
- Keep only the latest google‑services.json globally (one file for the entire system). A dedicated UI page uploads this file; the Create Definition form uses the parsed APP_IDs from that file via a dropdown. No per‑definition upload is required; no historical versions retained.
- `SERVER_IP` is free‑text.
- `APP_MODULE` values are fetched from MSSQL `TC_DASHBOARD_MODULE` (`no` as value, `label` as display).

## Queue and Status Sync (Tech Stack)

Recommendation: Keep infra simple—no external queue. Use NestJS Scheduler with DB‑backed state.

- Orchestrator: NestJS 11 + `@nestjs/schedule` for interval polling and a periodic sweeper.
- Persistence: MSSQL via TypeORM; Build table is the source of truth (status, `jenkinsQueueId`, `jenkinsBuildNumber`, `artifactPath`, `consoleUrl`, timestamps).
- Polling cadence: queue resolution every ~2s; build status every ~5s; sweeper every 1–2 minutes to resume after restarts.
- Idempotency/restarts: on service restart, the sweeper reloads any builds in `queued`/`building` and resumes polling; client refresh continues because the UI only reads build state by `buildId`.
- Optional future: switch to Redis + BullMQ if throughput requirements grow.

## Concurrency Behavior

- Creating new App Definitions is always allowed, regardless of ongoing builds.
- System‑wide single active build: at most one build may be in `queued` or `building` at any time.
- If a new trigger arrives while a build is active, the API SHALL respond `409 Conflict` and include the active `buildId` and its status, so the user can navigate to it or wait until completion.
