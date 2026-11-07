# DocuMind AI: Production Deployment Guide

This guide details recommended deployment architectures, hosting options, environment variable configurations, persistent storage handling, cold-start mitigation, and disaster recovery procedures for DocuMind AI.

---

## 1. Recommended Hosting Layout for Students

When deploying a document intelligence system that combines a modern SPA frontend, an asynchronous Python web framework, an embedded SQLite database, a vector store (ChromaDB), and uploaded PDF/text documents, the primary technical consideration is **storage persistence**. Standard free serverless hosts (like Vercel serverless functions or basic free tiers on Heroku/Render) have ephemeral filesystems: any file saved during runtime is discarded when the server restarts or scales down.

### Layout Option A: Unified Container Deployment (Recommended)
- **Architecture:** Multi-stage `Dockerfile` building the React frontend into static assets served directly by FastAPI via SPA static mounting, with an attached persistent volume mounted at `/app/storage`.
- **Target Platforms:** Render (Web Service with Disk), Railway, Fly.io, or any $5/mo VPS (Hetzner, DigitalOcean).
- **Why this is best for students:**
  - Zero cross-origin (CORS) issues since frontend and API share the exact same domain and port.
  - No complex microservice orchestration or multi-repo drift.
  - A single persistent volume stores the SQLite relational database (`storage/documind.db`), ChromaDB vectors (`storage/chroma`), and raw uploaded documents (`storage/uploads`).
  - Zero out-of-pocket egress network charges between frontend and backend.

### Layout Option B: Split Static CDN + Containerized API
- **Frontend:** Vercel, Netlify, or Cloudflare Pages (Free, global Anycast edge CDN).
- **Backend:** Railway, Fly.io, or Render Web Service with persistent volume.
- **Cross-Origin Setup:** `ALLOWED_ORIGINS` environment variable set to the frontend URL (e.g. `https://documind-ai.vercel.app`).
- **Why use this:** Instant edge delivery of static assets and automated preview deploys for frontend branches.

---

## 2. Platform Comparison and Verified Real Limits

All limits and quotas below are verified against official documentation as of November 2026.

| Hosting Provider | Service Plan | Storage & Persistence | Memory & CPU | Cold Start Behavior | Pricing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Render** | Free Web Service | Ephemeral disk (vanishes on restart) | 512 MB RAM, 0.1 CPU | Spins down after 15m inactivity (50s cold start) | Free |
| **Render** | Individual / Starter | Persistent disk supported ($0.25/GB/mo) | 512 MB to 2 GB RAM | Always-on, no spin-down | $7/mo base + storage |
| **Railway** | Hobby Plan | Persistent volumes supported ($0.25/GB/mo) | 8 GB RAM shared, 8 vCPU | No cold starts, always running | $5/mo credit included |
| **Fly.io** | Hobby / Free Allowance | 3 GB persistent volume included free | 256 MB to 512 MB RAM per VM | Auto-stop/start available (3s cold start) | Free tier available |
| **Google Cloud Run** | Pay-as-you-go | Cloud Storage FUSE volume mount | 512 MB to 4 GB RAM | Scale to zero (10s to 15s cold start) | Free tier covers first 2M requests |

### Google Gemini API Quota and Costs (Official)
- **Model:** `gemini-2.5-flash` (Generation) & `gemini-embedding-001` (Embeddings).
- **Free Tier:** 15 Requests Per Minute (RPM), 1,000,000 Tokens Per Minute (TPM), 1,500 Requests Per Day (RPD). Completely free of charge without credit card billing requirements.
- **Pay-As-You-Go Tier:** $0.075 per 1 million input tokens, $0.30 per 1 million output tokens.
- **Estimated Monthly Cost:** An active student portfolio demonstration processing 500 documents and 2,500 queries consumes less than $0.25 per month on the pay-as-you-go tier.

---

## 3. Environment Variable Matrix

Configure these variables in your hosting provider's dashboard or in a local `.env` file.

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `GOOGLE_API_KEY` | **Yes** | *None* | Google Gemini API key obtained from Google AI Studio. |
| `SESSION_SECRET` | **Yes** (Prod) | Auto-generated | 64-character secret key used to cryptographically sign session cookies. |
| `ENVIRONMENT` | No | `production` | Set to `production` in live environments or `development` locally. |
| `DATA_RETENTION_DAYS` | No | `7` | Retention window before orphaned workspaces are purged by the reaper. |
| `ALLOWED_ORIGINS` | No | `*` | Comma-separated list of allowed CORS origins (e.g. `https://documind.vercel.app`). |
| `SQLITE_DB_PATH` | No | `storage/documind.db` | Absolute or relative filesystem path to the SQLite database file. |
| `CHROMA_DIR` | No | `storage/chroma` | Directory where ChromaDB vector index files are persisted. |
| `UPLOAD_DIR` | No | `storage/uploads` | Directory where uploaded PDF and TXT files are stored on disk. |
| `MAX_FILE_SIZE_MB` | No | `20` | Maximum single-file upload size in megabytes. |
| `MAX_PDF_PAGES` | No | `50` | Maximum page count allowed for single PDF uploads. |
| `RATE_LIMIT_UPLOAD` | No | `20/minute` | Rate limit for document upload and ingestion endpoints. |
| `RATE_LIMIT_QUERY` | No | `30/minute` | Rate limit for chat question answering queries. |
| `GENERATION_MODEL` | No | `gemini-2.5-flash` | Gemini model name for grounded answer generation. |
| `EMBEDDING_MODEL` | No | `gemini-embedding-001` | Gemini model name for vector embeddings. |

---

## 4. Step-by-Step Deployment Walkthroughs

### Option A: Deploying on Railway (Recommended)
Railway offers full Dockerfile support and persistent volume attachments with $5 free monthly credits.

1. Fork or push your DocuMind AI repository to GitHub.
2. Sign in to [Railway](https://railway.com) and click **New Project** -> **Deploy from GitHub repo**.
3. Select the `Document-AI` repository.
4. Railway will automatically detect the root `Dockerfile`.
5. Under service **Settings** -> **Volumes**, click **Add Volume**:
   - Mount Path: `/app/storage`
   - Size: `5 GB`
6. Under service **Variables**, configure:
   - `GOOGLE_API_KEY`: Your Google AI Studio API key.
   - `SESSION_SECRET`: Generate a random 32-byte hex string (`openssl rand -hex 32`).
   - `ENVIRONMENT`: `production`
7. Click **Deploy**. Railway will build the multi-stage container and expose an HTTPS URL.

### Option B: Deploying on Render (Free Tier Testing)
Render allows zero-cost testing with the caveat of ephemeral storage on the free plan.

1. Create a new **Web Service** on [Render](https://render.com) connected to your GitHub repository.
2. Select **Docker** as the runtime environment.
3. Under **Advanced** -> **Environment Variables**, add `GOOGLE_API_KEY` and `SESSION_SECRET`.
4. Deploy the service.
5. Note: When running on Render's free tier, uploaded files and databases reset when the service idles after 15 minutes of inactivity. For production permanence, upgrade to the Starter plan and attach a Persistent Disk at `/app/storage`.

### Option C: Local Production Testing via Docker Compose
To verify the exact production container locally:

```bash
# 1. Build and launch the containerized application
docker compose up --build -d

# 2. Check startup logs and health status
docker compose logs -f

# 3. Verify readiness probe
curl http://localhost:8000/api/ready

# 4. Open in browser
open http://localhost:8000
```

---

## 5. Cold-Start Handling and Transparency

Free-tier cloud hosts (such as Render Free or Cloud Run) spin down containers after periods of inactivity. A cold start can take between 25 and 55 seconds while the VM provisions and the Python runtime imports heavy libraries (PyMuPDF, ChromaDB, FastAPI).

### How DocuMind AI Handles Cold Starts Honestly
1. The frontend application makes an immediate health check request (`GET /api/ready`) upon launch.
2. If the API fails to respond within 2.5 seconds, the `ConnectionBanner` component displays an honest message:
   > *"Connecting to research server. Free-tier cloud instances may require 30 to 45 seconds to wake up from cold start."*
3. The component displays an animated loading spinner, disables destructive workspace controls, and exposes an interactive **Retry Connection** button.
4. As soon as `/api/ready` returns HTTP 200, the banner gracefully dismisses, giving users confidence that the system is ready without confusing errors or silent freezes.

---

## 6. Backup, Rollback, and Disaster Recovery

### Database and Vector Backup Procedure
Because all state resides inside the `/app/storage` directory, backing up DocuMind AI is a single-step operation:

```bash
# Archive the persistent storage directory
tar -czvf documind_backup_$(date +%Y%m%d).tar.gz ./storage

# Restore from an archive
tar -xzvf documind_backup_20261107.tar.gz -C ./
```

### Git Rollback Procedure
If a breaking change or regression is pushed to production:

```bash
# Identify previous stable commit
git log --oneline -n 5

# Revert to stable commit
git revert <faulty-commit-sha>
git push origin main
```
CI/CD will automatically run the test suite and rebuild the production container image.
