# ====================================================================
# DocuMind AI: Multi-Stage Production Container
# Stage 1: Build production React + Vite single page application
# Stage 2: Minimal Python runtime with persistent storage and healthchecks
# ====================================================================

FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ====================================================================
# Runtime Stage
# ====================================================================
FROM python:3.12-slim AS runner

# System dependencies for PyMuPDF, SQLite, and container health probes
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ ./backend/

# Copy compiled frontend assets from builder stage
COPY --from=frontend-builder /build/dist ./frontend/dist

# Initialize persistent storage mount directories
RUN mkdir -p /app/storage/uploads /app/storage/chroma

ENV PYTHONUNBUFFERED=1 \
    APP_ENV=production \
    STORAGE_DIR=/app/storage \
    UPLOADS_DIR=/app/storage/uploads \
    CHROMA_DIR=/app/storage/chroma \
    DATABASE_URL=sqlite:////app/storage/documind.db \
    PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/ready || exit 1

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

