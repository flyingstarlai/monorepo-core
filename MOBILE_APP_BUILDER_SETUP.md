# Mobile App Builder Setup Guide

This guide covers setting up the Mobile App Builder feature for Android application builds.

## Prerequisites

- Docker and Docker Compose
- Jenkins server
- MinIO instance (for artifact storage)
- Android project with Gradle wrapper
- Google Services JSON file for Firebase/Google Play integration
- Access to MSSQL database with `TC_DASHBOARD_MODULE` table

## Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Mobile App Builder Configuration
MOBILE_APP_BUILDER_JENKINS_URL=http://localhost:8080
MOBILE_APP_BUILDER_JENKINS_USERNAME=admin
MOBILE_APP_BUILDER_JENKINS_PASSWORD=admin
MOBILE_APP_BUILDER_JENKINS_JOB_NAME=android-app-builder

# MinIO Configuration (for artifact storage)
MOBILE_APP_BUILDER_MINIO_ENDPOINT=localhost:9000
MOBILE_APP_BUILDER_MINIO_ACCESS_KEY=minioadmin
MOBILE_APP_BUILDER_MINIO_SECRET_KEY=minioadmin
MOBILE_APP_BUILDER_MINIO_BUCKET=android-artifacts
```

## Jenkins Setup

### 1. Install Required Plugins

Install these Jenkins plugins:

- Pipeline: Groovy
- Pipeline: Stage Step
- Docker Pipeline
- Blue Ocean
- Credentials Binding

### 2. Configure Jenkins Credentials

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Add **Username with password** credentials for:
   - Jenkins API access
   - MinIO access (if using MinIO for artifact storage)

### 3. Create Pipeline Job

1. Go to **New Item** → **Pipeline**
2. Configure:
   - **Name**: `android-app-builder`
   - **Pipeline script**: Use the Jenkinsfile in `devops/pipelines/android-app-builder/Jenkinsfile`
   - **This project is parameterized**: ✅
   - **Parameters**:
     - `APP_NAME` (String)
     - `APP_MODULE` (String)
     - `SERVER_IP` (String)
     - `GOOGLE_SERVICES_URL` (String, optional)
     - `ANDROID_IMAGE` (String)
     - `MINIO_PUBLIC_BASE` (String)

## MinIO Setup

### 1. Install MinIO

```bash
docker run -p 9000:9000 -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -e "MINIO_BROWSER=on" \
  -v minio_data:/data \
  minio/minio:latest server /data --console-address ":9001"
```

### 2. Create Bucket

```bash
# Using MinIO Client (mc)
mc alias set minio http://localhost:9000 minioadmin minioadmin
mc mb minio/android-artifacts
```

## CI/CD Setup with Docker Compose

Use the provided `devops/docker-compose.ci.yml`:

```bash
cd devops
docker-compose -f docker-compose.ci.yml up -d
```

This starts:

- Jenkins server with Docker-in-Docker support
- MinIO for artifact storage
- Docker daemon for building Android apps

## Android Project Requirements

### Project Structure

```
android/
├── app/
│   └── google-services.json  # Firebase configuration
├── build.gradle
├── app/build.gradle
└── gradlew
```

### google-services.json

Place your Firebase/Google Play configuration file at:

- `android/app/google-services.json`

The system will automatically extract the `package_name` and derive the `APP_ID`.

### Build Configuration

The Jenkins job expects:

- Gradle wrapper (`gradlew` or `gradle` command)
- Release build variant (`assembleRelease`)
- APK output in `build/outputs/apk/` directory

## API Endpoints

### Module Catalog

- `GET /app-builder/modules` - List available modules
- `GET /app-builder/modules/:id` - Get specific module

### Mobile App Definitions

- `GET /app-builder/definitions` - List all definitions
- `POST /app-builder/definitions` - Create definition (admin/manager)
- `GET /app-builder/definitions/:id` - Get specific definition
- `PUT /app-builder/definitions/:id` - Update definition (admin/manager)
- `DELETE /app-builder/definitions/:id` - Delete definition (admin/manager)
- `POST /app-builder/definitions/:id/google-services` - Upload Google Services (admin/manager)

### Build Management

- `POST /app-builder/definitions/:id/build` - Trigger build (admin/manager)
- `GET /app-builder/builds` - List all builds
- `GET /app-builder/builds/:id` - Get specific build
- `GET /mobile-app-builder/builds/:id/status` - Get build status from Jenkins
- `GET /mobile-app-builder/builds/:id/download` - Get presigned download URL (admin/manager)

## Role-Based Access Control

- **Admin/Manager**: Full access to all endpoints
- **User**: Read-only access to definitions and builds
- **Unauthenticated**: No access

## Build Process Flow

1. **Create Definition**: Upload Google Services JSON and configure app details
2. **Trigger Build**: Queue build with Jenkins
3. **Build Execution**: Jenkins builds Android app using Docker
4. **Artifact Upload**: APK uploaded to MinIO with structured path
5. **Download**: Users download via presigned URL (admin/manager only)

## Artifact Storage Structure

```
android-artifacts/
├── {APP_ID}/
│   ├── {APP_MODULE}/
│   │   ├── {APP_ID}-{SAFE_APP_NAME}.apk
│   │   └── build-metadata.json
```

## Troubleshooting

### Common Issues

1. **Build fails with "google-services.json not found"**
   - Ensure GOOGLE_SERVICES_URL is accessible
   - Check file exists in Android project

2. **Module validation fails**
   - Verify module exists in TC_DASHBOARD_MODULE table
   - Check module code format (e.g., "001")

3. **Jenkins authentication fails**
   - Verify Jenkins credentials
   - Check CSRF crumb handling

4. **MinIO upload fails**
   - Verify MinIO credentials and bucket permissions
   - Check MinIO service is running

### Logs

- Jenkins logs: `http://localhost:8080/job/android-app-builder/`
- API logs: Check your application logs
- Build logs: Available via Jenkins console output

## Development

For local development with mocked Jenkins:

```bash
# Set mock environment
MOBILE_APP_BUILDER_MOCK_JENKINS=true

# Run API
npm run start:dev
```

This will use mock responses for Jenkins integration while allowing full API testing.
