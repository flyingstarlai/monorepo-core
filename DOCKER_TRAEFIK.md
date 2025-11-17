# Docker Compose with Traefik

This Docker Compose configuration includes ACM services with Traefik reverse proxy integration.

## Services

### ACM API

- **URL**: `http://acm-api.twsbp.com`
- **Internal Port**: 3000
- **Description**: Account Manager API service

### ACM Web

- **URL**: `http://acm.twsbp.com`
- **Internal Port**: 80
- **Description**: Account Manager web application

## Prerequisites

1. **Traefik Network**: Ensure the external `traefik-proxy` network exists:

   ```bash
   docker network create traefik-proxy
   ```

2. **Environment Variables**: Copy and configure the environment file:
   ```bash
   cp .env .env.traefik
   ```

## Deployment

### Start Services

```bash
docker-compose -f docker-compose.traefik.yml --env-file .env.traefik up -d
```

### Stop Services

```bash
docker-compose -f docker-compose.traefik.yml down
```

### View Logs

```bash
docker-compose -f docker-compose.traefik.yml logs -f
```

### Scale Services

```bash
docker-compose -f docker-compose.traefik.yml up -d --scale api=2 --scale web=2
```

## Configuration

### Environment Variables

| Variable         | Description                  | Default            |
| ---------------- | ---------------------------- | ------------------ |
| `API_IMAGE`      | Docker image for API service | `twsbpmac/acm-api` |
| `WEB_IMAGE`      | Docker image for web service | `twsbpmac/acm`     |
| `TAG`            | Docker image tag             | `latest`           |
| `DB_HOST`        | Database host                | Required           |
| `DB_PORT`        | Database port                | `1433`             |
| `DB_USERNAME`    | Database username            | Required           |
| `DB_PASSWORD`    | Database password            | Required           |
| `DB_DATABASE`    | Database name                | Required           |
| `JWT_SECRET`     | JWT secret key               | Required           |
| `JWT_EXPIRES_IN` | JWT expiration time          | `24h`              |

### Network Configuration

- **acm-network**: Internal network for ACM services (172.21.0.0/16)
- **traefik-proxy**: External network for Traefik integration

### Health Checks

All services include comprehensive health checks:

- **Portainer**: HTTP check on port 9000
- **API**: Node.js HTTP check on port 3000
- **Web**: Curl check on port 80

### Resource Limits

| Service   | Memory Limit | Memory Reservation |
| --------- | ------------ | ------------------ |
| Portainer | 256M         | 128M               |
| API       | 512M         | 256M               |
| Web       | 256M         | 128M               |

## Troubleshooting

### Check Service Status

```bash
docker-compose -f docker-compose.traefik.yml ps
```

### View Service Logs

```bash
docker-compose -f docker-compose.traefik.yml logs [service-name]
```

### Network Issues

Verify the Traefik network exists:

```bash
docker network ls | grep traefik-proxy
```

### Health Check Failures

Check service health:

```bash
docker inspect --format='{{.State.Health.Status}}' [container-name]
```

## Security Considerations

1. **Non-root containers**: All services run as non-root users
2. **Network isolation**: Services are isolated in dedicated networks
3. **Resource limits**: Memory limits prevent resource exhaustion
4. **HTTP only**: Configuration uses HTTP web entrypoint only

## Backup and Recovery

### Backup Volume

```bash
docker run --rm -v portainer_data:/data -v $(pwd):/backup alpine tar czf /backup/portainer-backup.tar.gz -C /data .
```

### Restore Volume

```bash
docker run --rm -v portainer_data:/data -v $(pwd):/backup alpine tar xzf /backup/portainer-backup.tar.gz -C /data
```
