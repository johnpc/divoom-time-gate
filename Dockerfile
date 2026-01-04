# Use Node.js base image
FROM node:20-slim

# Install canvas dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only package files first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source files
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Remove source files and reinstall only production dependencies
RUN rm -rf src tsconfig.json && \
    npm prune --production

# Create run script
RUN echo '#!/bin/sh\n\
SLEEP_DURATION=${SLEEP_DURATION:-300}\n\
echo "Starting update loop with ${SLEEP_DURATION} seconds interval..."\n\
ITERATION=0\n\
while true; do\n\
  ITERATION=$((ITERATION + 1))\n\
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting iteration ${ITERATION}"\n\
  node dist/index.js || echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Script failed - restarting"\n\
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Sleeping ${SLEEP_DURATION}s"\n\
  sleep ${SLEEP_DURATION}\n\
done' > /app/run.sh && chmod +x /app/run.sh

CMD ["/app/run.sh"]
