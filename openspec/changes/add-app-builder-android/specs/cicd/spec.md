## ADDED Requirements

### Requirement: CI/CD Stack With Jenkins And MinIO

The project SHALL provide a containerized CI/CD stack for Android builds.

- A `docker-compose.ci.yml` SHALL define services: `jenkins` (LTS), `dind` (Docker-in-Docker), `minio`, and an init job to create the artifacts bucket.
- Jenkins SHALL communicate with `dind` using `DOCKER_HOST=tcp://dind:2375` to run Android build containers.
- MinIO SHALL be reachable on ports 9000 (S3 API) and 9001 (Console), with a default bucket `android-artifacts`.
- Artifacts in MinIO SHALL be private by default; downloads occur via API-issued presigned URLs (RBAC enforced).

#### Scenario: Bring up CI stack locally

- WHEN an engineer runs `docker compose -f docker-compose.ci.yml up -d`
- THEN Jenkins is available on http://localhost:8080 and MinIO Console on http://localhost:9001
- AND the `android-artifacts` bucket exists and is NOT publicly readable.

### Requirement: Jenkins Pipeline For Android Build

A Jenkins Pipeline (Jenkinsfile) SHALL build the APK using a Docker Android SDK image and upload artifacts to MinIO.

- Parameters: `APP_NAME`, `APP_ID`, `APP_MODULE`, `SERVER_IP`, `GOOGLE_SERVICES_URL`.
- Steps: checkout, download google-services.json (from API), derive `APP_ID` from JSON as specified, run Gradle to build APK, upload to MinIO with the required naming and path, print the final artifact location.
- The pipeline SHALL run inside a Docker agent image with Android SDK and JDK.
- The pipeline SHALL derive version information from the source (no version parameters accepted).

#### Scenario: Successful pipeline run

- WHEN the pipeline runs with valid parameters
- THEN it outputs an APK, uploads it to MinIO at `android-artifacts/<APP_ID>/<APP_MODULE>/<APP_ID>-<sanitized-APP_NAME>.apk`
- AND it prints the artifact location for the API to convert to a presigned URL for authorized users.

### Requirement: Jenkins Credentials And Security

CI/CD sensitive values MUST be provided via environment variables or Jenkins credentials, not hard-coded.

- Jenkins URL, user, and API token used by the API SHALL be configurable via environment variables.
- MinIO endpoint and access keys SHALL be set as Jenkins credentials or environment variables used by the pipeline.
- Development environments MAY configure Jenkins and MinIO to use externally reachable IP addresses; the API and Jenkins pipeline SHALL honor the endpoints provided via environment variables without assuming `localhost`.

#### Scenario: Credentials configured

- GIVEN Jenkins has credentials for MinIO and the API has Jenkins credentials
- WHEN a build is triggered
- THEN the build succeeds without exposing secrets in logs beyond what is necessary.

#### Scenario: Development uses external Jenkins and MinIO IPs

- GIVEN `JENKINS_URL` and the MinIO endpoint environment variables point to externally reachable IP addresses instead of `localhost`
- WHEN a build is triggered from the App Builder API
- THEN the API successfully authenticates to Jenkins using the external URL
- AND the Jenkins pipeline uploads artifacts to MinIO using the external endpoint without requiring code changes.
