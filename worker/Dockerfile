# ==============================================================================
# CREATOR STUDIO — CONTAINERIZED CLOUD RENDERING WORKER (GOOGLE CLOUD RUN)
# ==============================================================================

FROM node:20-bookworm-slim

# Install FFmpeg, fonts, and required media libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-freefont-ttf \
    fonts-dejavu \
    fonts-noto-color-emoji \
    ca-certificates \
    curl \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source
COPY . .

# Set environment defaults for Cloud Run
ENV NODE_ENV=production
ENV PORT=8080

# Security: run as non-root user
USER node

EXPOSE 8080

# Use dumb-init to handle PID 1 signal forwarding and graceful container shutdown
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "index.js"]
