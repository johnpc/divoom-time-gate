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

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN echo '#!/bin/sh\n\
SLEEP_DURATION=${SLEEP_DURATION:-300}\n\
echo "Starting update loop with ${SLEEP_DURATION} seconds interval..."\n\
ITERATION=0\n\
while true; do\n\
  ITERATION=$((ITERATION + 1))\n\
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting iteration ${ITERATION}"\n\
  npm start || echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Script failed - restarting"\n\
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Sleeping ${SLEEP_DURATION}s"\n\
  sleep ${SLEEP_DURATION}\n\
done' > /app/run.sh
RUN chmod +x /app/run.sh

CMD ["/app/run.sh"]
