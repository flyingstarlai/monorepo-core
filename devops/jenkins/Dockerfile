FROM jenkins/jenkins:lts-jdk17

USER root

# Install utilities: docker client, curl, jq, unzip, mc (MinIO client)
RUN apt-get update && apt-get install -y \
    ca-certificates curl jq unzip git sudo && \
    rm -rf /var/lib/apt/lists/*

# Docker CLI (for talking to DinD)
ARG DOCKER_CLI_VERSION=27.2.0
RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_CLI_VERSION}.tgz \
    | tar xz -C /usr/local/bin --strip-components=1 docker/docker && \
    chmod +x /usr/local/bin/docker

# MinIO client
ARG MC_VERSION=RELEASE.2024-11-13T22-32-04Z
RUN curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/archive/mc.${MC_VERSION} -o /usr/local/bin/mc && \
    chmod +x /usr/local/bin/mc

# Allow jenkins user to run docker
RUN usermod -aG root jenkins && usermod -aG staff jenkins

# Preinstall common plugins
RUN jenkins-plugin-cli --plugins \
    workflow-aggregator \
    credentials \
    blueocean \
    pipeline-utility-steps \
    docker-workflow \
    configuration-as-code

USER jenkins

# Default environment that Jenkins Pipelines can use
ENV MINIO_ENDPOINT="http://minio:9000" \
    MINIO_BUCKET_ARTIFACTS="android-artifacts" \
    MINIO_ACCESS_KEY="miniouser" \
    MINIO_SECRET_KEY="miniosecret"
