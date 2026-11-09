# Google Gemini API Cost Safety & Key Management Checklist

**Document:** `docs/gemini-cost-safety.md`  
**Date:** November 2026  
**Auditor Role:** Security & Release Engineer  

> **Security Rule:** Never commit your Gemini API key to Git and never paste secrets into chat or tickets. All API keys must be managed through secure environment variables in hosting dashboards.

---

## 1. Separate Production API Key Setup

1. **Create an Isolated Project in Google Cloud Console:**
   - Go to [Google AI Studio](https://aistudio.google.com/) or the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a dedicated project named `documind-ai-production` rather than reusing a personal or experimental project.
2. **Generate a Dedicated Key:**
   - Under API Keys, generate a key exclusively for DocuMind AI production deployment.
   - Do not share this key with other applications or local test runs.

---

## 2. API Key Restrictions & Guardrails

1. **API Scope Restriction:**
   - In Google Cloud Console -> **APIs & Services** -> **Credentials**, select your API key.
   - Under **API restrictions**, select **Restrict key** and choose only:
     - **Generative Language API** (Google AI Studio / Gemini API).
   - This ensures that if the key is ever intercepted, it cannot be used against other Google Cloud resources (Compute Engine, Cloud Storage, BigQuery).
2. **Quota & Rate Limits:**
   - In Google Cloud Console -> **APIs & Services** -> **Generative Language API** -> **Quotas & System Limits**:
     - Review requests per minute (RPM) and requests per day (RPD) caps.
     - The free tier provides 15 RPM and 1,500 RPD for `gemini-2.5-flash` and `text-embedding-004`, which is ample for testing and evaluation without incurring billing surprises.

---

## 3. Budget Alerts & Spending Caps

1. **Set Up Google Cloud Budget Alert:**
   - Navigate to **Billing** -> **Budgets & alerts** in Google Cloud Console.
   - Create a budget for project `documind-ai-production`:
     - Target Amount: Set a modest monthly cap (e.g. $10.00 or $25.00).
     - Threshold Alerts: Set email alerts at 50%, 80%, 90%, and 100% of the target amount.
2. **Auto-Shutdown / Circuit Breaker Guard:**
   - DocuMind AI includes an application-level circuit breaker in `backend/app/utils/circuit_breaker.py`.
   - If Google Gemini returns consecutive 429 (Rate Limit) or 503 (Unavailable) errors, the circuit breaker opens for 30 seconds, rejecting inbound queries with a 503 error to prevent cascading quota exhaustion.

---

## 4. Key Emergency Rotation Procedure

If your API key is ever accidentally logged, committed, or exposed:

1. **Immediate Revocation:**
   - Open [Google AI Studio API Keys](https://aistudio.google.com/app/apikey).
   - Click the trash icon next to the compromised key to immediately invalidate it worldwide.
2. **Generate Replacement Key:**
   - Click **Create API key** in Google AI Studio to provision a fresh credential.
3. **Update Cloud Host Environment Variable:**
   - In your Railway or Render dashboard, go to **Variables**.
   - Update `GEMINI_API_KEY` with the new key value.
   - Trigger a redeploy. Service will resume within 15 to 30 seconds.
4. **Audit Git History:**
   - Run `git log -S "AIza" --all` locally to ensure no commit ever touched the repository containing an exposed key.
