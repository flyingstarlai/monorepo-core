# Jenkins Configuration Guide

## Environment Variables

Add the following environment variables to your `.env` file for Jenkins integration:

### Jenkins Connection

```bash
# Jenkins Server Configuration
JENKINS_URL=http://your-jenkins-server:8080
JENKINS_USERNAME=your_jenkins_username
JENKINS_PASSWORD=your_jenkins_api_token
JENKINS_JOB_NAME=android-app-builder
```

### MinIO Configuration (for Jenkins)

```bash
# MinIO Configuration (used by Jenkins pipeline)
MINIO_ENDPOINT=60.248.245.252:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=android-builds
```

## Where to Get Jenkins Credentials

### 1. Jenkins URL

- **External Jenkins**: `http://60.248.245.252:8080`
- **Production**: `http://your-jenkins-domain:8080` or `https://your-jenkins-domain`
- **Local Development**: `http://localhost:8080` (if running local Jenkins)

### 2. Jenkins Username

- Default admin username: `admin`
- Or your Jenkins service account username

### 3. Jenkins API Token (Recommended)

Instead of password, use an API token for better security:

1. **Login to Jenkins**: Go to `http://your-jenkins-server:8080`
2. **Navigate**: Click on your username → Configure → API Token
3. **Add Token**: Click "Add new token", give it a name (e.g., "mobile-app-builder")
4. **Copy Token**: Copy the generated token immediately
5. **Use Token**: Set `JENKINS_PASSWORD=your_generated_api_token`

### 4. Alternative: Jenkins Password

- You can use the actual Jenkins password
- Not recommended for production environments

## Jenkins Job Setup

### 1. Create Jenkins Job

1. Go to Jenkins Dashboard → New Item
2. Enter job name: `tc-app`
3. Choose "Pipeline" and click OK
4. In Pipeline configuration:
   - Definition: "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: Your repository URL
   - Script Path: `devops/pipelines/app-builder/Jenkinsfile`

### 2. Configure Jenkins Credentials

For production, store credentials in Jenkins:

1. **MinIO Credentials**:
   - Go to Manage Jenkins → Manage Credentials
   - Add "Username with password" credentials
   - ID: `minio-access-key`, `minio-secret-key`

2. **Jenkins Credentials**:
   - Store API token securely in Jenkins credential store

## Docker Compose Setup

For local development, use the provided CI stack:

```bash
# Start Jenkins + MinIO + Docker-in-Docker
docker-compose -f devops/docker-compose.ci.yml up -d

# Access Jenkins
# URL: http://localhost:8080
# Username: admin
# Password: admin123 (change for production)

# Access MinIO Console
# URL: http://localhost:9001
# Username: minioadmin
# Password: minioadmin (change for production)
```

## Production Considerations

### Security

- Use HTTPS URLs in production
- Change default passwords
- Use Jenkins API tokens instead of passwords
- Store credentials in Jenkins credential store
- Use environment variables or secret management

### Network

- Ensure Jenkins can reach your API server
- Ensure Jenkins can reach MinIO
- Configure firewall rules appropriately

### SSL/TLS

- For production: `https://your-jenkins-server`
- Update `JENKINS_URL` accordingly
- Configure SSL certificates in Jenkins

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check Jenkins URL and port
2. **401 Unauthorized**: Verify username and API token
3. **403 Forbidden**: Check user permissions in Jenkins
4. **Job Not Found**: Verify `JENKINS_JOB_NAME` matches actual job name

### Testing Connection

```bash
# Test Jenkins connectivity
curl -u "username:api_token" http://your-jenkins-server:8080/api/json

# Test job existence
curl -u "username:api_token" http://your-jenkins-server:8080/job/android-app-builder/api/json
```

## Example .env Configuration

```bash
# External Jenkins Server Configuration
JENKINS_URL=http://60.248.245.252:8080
JENKINS_USERNAME=your_jenkins_username
JENKINS_PASSWORD=your_jenkins_api_token
JENKINS_JOB_NAME=tc-app

# MinIO Configuration (Jenkins and MinIO on same server, API accesses externally)
MINIO_ENDPOINT=60.248.245.252:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=android-builds
```

# MinIO Configuration

MINIO_ENDPOINT=minio.company.com:9000
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
MINIO_BUCKET=android-artifacts

```

```
