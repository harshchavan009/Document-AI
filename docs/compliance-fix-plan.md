# DocuMind AI: Compliance Fix Plan

**Document:** `docs/compliance-fix-plan.md`  
**Date:** November 2026  
**Roles:** QA Lead, Requirements Analyst, Senior Full-Stack Engineer, AI/RAG Engineer  
**Status:** Step 2 Deliverable (Awaiting User Sign-Off Before Code Modification)

---

## 1. Compliance Matrix Summary by Section

| Section | Evaluated Area | Pass | Partial | Fail | Not Verifiable | Total |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **A** | Product and Landing Page | 8 | 1 (`A8`) | 0 | 0 | 9 |
| **B** | Main Workspace Shell & Home | 3 | 1 (`B1` deviation) | 0 | 0 | 4 |
| **C** | Document Library | 6 | 0 | 0 | 0 | 6 |
| **D** | AI Research Workspace Desk | 6 | 1 (`D6`) | 0 | 0 | 7 |
| **E** | Document Preview & Reader | 4 | 0 | 0 | 0 | 4 |
| **F** | RAG Pipeline Execution | 9 | 1 (`F7`) | 0 | 0 | 10 |
| **G** | Backend Architecture & API | 5 | 1 (`G4`) | 0 | 0 | 6 |
| **H** | Frontend Technology & UI | 4 | 0 | 0 | 0 | 4 |
| **I** | Security & Reliability | 6 | 0 | 0 | 0 | 6 |
| **J** | Pytest & Evaluation Suite | 18 | 0 | 0 | 1 (`J18`) | 19 |
| **K** | User Experience Details | 5 | 0 | 0 | 0 | 5 |
| **L** | Documentation System | 3 | 1 (`L1`) | 0 | 0 | 4 |
| **M** | Delivery & External Artifacts | 0 | 0 | 0 | 2 (`M1`, `M2`) | 2 |
| **R** | Cross-Cutting Rules | 3 | 0 | 0 | 0 | 3 |
| **Total** | **All Sections** | **77** | **5** | **0** | **3** | **85** |

---

## 2. Ranked Gaps and Planned Fixes

### Severity Tier 1: Blocker Gaps
None. Core RAG pipeline, server-side citation validation, multi-tenant isolation, SQLite persistence, ChromaDB vector storage, and all 43 automated tests pass with 0 failures.

---

### Severity Tier 2: High Severity Gaps

#### Gap 1: Missing Required Endpoint `GET /api/workspaces/{workspace_id}/documents` (`G4`)
- **Finding:** Calling `GET /api/workspaces/{workspace_id}/documents` currently returns `404 Not Found` (`{"detail":"API endpoint not found"}`). The frontend currently queries documents via `GET /api/documents?workspace_id=...`.
- **Planned Fix:** Add the explicit route in `backend/app/api/workspaces.py`:
  ```python
  @router.get("/{workspace_id}/documents", response_model=DocumentListResponse)
  def list_workspace_documents(
      workspace_id: str,
      request: Request,
      db: Session = Depends(get_db)
  ):
      session_id = get_or_create_session_id(request)
      verify_workspace_access(workspace_id, session_id, db)
      docs = db.query(Document).filter(Document.workspace_id == workspace_id).all()
      return DocumentListResponse(documents=[DocumentResponse.model_validate(d) for d in docs])
  ```
- **Files to Change:** [`backend/app/api/workspaces.py`](file:///Users/harsh/Desktop/Document-AI/backend/app/api/workspaces.py), [`backend/tests/test_isolation_security.py`](file:///Users/harsh/Desktop/Document-AI/backend/tests/test_isolation_security.py) (add test verification).
- **Effort:** 15 minutes.
- **Risk:** Low. Completely additive; does not alter existing endpoints.

#### Gap 2: README Structure Missing 23 Required Section Headings (`L1`)
- **Finding:** The current `README.md` is organized into 10 consolidated chapters. While rich in technical detail, it does not explicitly match the 23 numbered sections demanded by the evaluation rubric:
  1. Introduction, 2. Problem Statement, 3. Objectives, 4. Main Features, 5. Technology Stack, 6. Architecture Diagram, 7. RAG Workflow, 8. Ingestion Pipeline, 9. Chunking Methodology, 10. Embedding Generation, 11. Vector Database Implementation, 12. Retrieval Process, 13. Prompt Engineering, 14. Source Citation Implementation, 15. API Documentation, 16. Folder Structure, 17. Installation, 18. Environment Configuration, 19. Local Execution, 20. Testing, 21. Deployment, 22. Limitations, 23. Future Improvements.
- **Planned Fix:** Restructure and expand `README.md` to feature all 23 explicit headings with complete technical prose, ASCII/Mermaid architecture diagrams, and genuine unmocked PNG screenshots.
- **Files to Change:** [`README.md`](file:///Users/harsh/Desktop/Document-AI/README.md).
- **Effort:** 45 minutes.
- **Risk:** Low. Documentation only.

---

### Severity Tier 3: Medium Severity Gaps

#### Gap 3: RAG System Prompt Formal 8-Rule & Output Specification (`F7`)
- **Finding:** `RAG_SYSTEM_PROMPT` in `backend/app/prompts/rag_prompts.py` enforces 6 grounding rules. The internship specification outlines an 8-rule structure with explicit ROLE, TASK, RULES 1 to 8, and dedicated OUTPUT format directives.
- **Planned Fix:** Calibrate `backend/app/prompts/rag_prompts.py` to structure the system prompt with explicit sections:
  - ROLE: Verifiable Document Intelligence Specialist
  - TASK: Synthesize evidence across retrieved excerpts
  - RULES 1 to 8: 1. Strict Grounding, 2. Anti-Hallucination, 3. Inline Citation Markers, 4. Insufficient Context Refusal, 5. Untrusted Context Quarantine, 6. Synthesis vs Direct Fact, 7. Citation Numbering Continuity, 8. Zero External Fabrication.
  - OUTPUT: Markdown layout specification.
- **Files to Change:** [`backend/app/prompts/rag_prompts.py`](file:///Users/harsh/Desktop/Document-AI/backend/app/prompts/rag_prompts.py).
- **Effort:** 15 minutes.
- **Risk:** Low. Validated against `test_retrieval_grounding.py` and `test_prompt_injection_boundary_defense.py`.

#### Gap 4: Missing Explicit "Clear Conversation" Button in Research Canvas Header (`D6`)
- **Finding:** Users can start a new research thread via "Prior Sessions > New" in the left panel, and can copy answers via the copy icon on messages. However, an explicit "Clear conversation" / "New session" button is absent from the center conversational canvas sub-header.
- **Planned Fix:** Add a visible "Clear conversation" / "New session" action button with `Trash2` or `Plus` icon directly in the canvas sub-header in `ResearchPage.jsx`.
- **Files to Change:** [`frontend/src/pages/ResearchPage.jsx`](file:///Users/harsh/Desktop/Document-AI/frontend/src/pages/ResearchPage.jsx#L625-L660).
- **Effort:** 15 minutes.
- **Risk:** Low. Pure frontend state reset (`startNewSession()`).

#### Gap 5: Missing Dedicated Pre-Footer Call-to-Action Banner on Landing Page (`A8`)
- **Finding:** The landing page transitions directly from Section 6 (FAQ accordion) into the footer without a dedicated pre-footer call-to-action banner.
- **Planned Fix:** Add a clean editorial pre-footer banner section inviting visitors to open the workspace or load the sample paper before the site footer in `LandingPage.jsx`.
- **Files to Change:** [`frontend/src/pages/LandingPage.jsx`](file:///Users/harsh/Desktop/Document-AI/frontend/src/pages/LandingPage.jsx).
- **Effort:** 15 minutes.
- **Risk:** Low. Pure visual layout.

#### Gap 6: Frontend E2E Test Suite Selector Alignment (`frontend/tests/e2e.test.js`)
- **Finding:** Test 4 in `frontend/tests/e2e.test.js` timed out waiting for `"Parameter Specification"` on `/workspace/settings`. In Phase P2, technical parameters were split to `/system` while `/workspace/settings` retained user preferences.
- **Planned Fix:** Update `frontend/tests/e2e.test.js` Test 4 to navigate to `/system` to verify runtime parameters and `/workspace/settings` to verify appearance and data export controls.
- **Files to Change:** [`frontend/tests/e2e.test.js`](file:///Users/harsh/Desktop/Document-AI/frontend/tests/e2e.test.js).
- **Effort:** 10 minutes.
- **Risk:** Low. Test script update.

---

### Severity Tier 4: Low Severity / Polish Items

#### Gap 7: Sidebar Layout Deviations (`B1`)
- **Finding:** "New workspace" is nested inside the workspace switcher dropdown, and "Recent activity" is presented on the Home overview page (`/workspace`) rather than as standalone sidebar navigation links.
- **Status:** Record as an intentional UX architectural deviation (keeps the primary sidebar clean with 4 high-value destinations: Home, Library, Research Desk, Settings).

---

## 3. Items Requiring User Input ("Not Verifiable")

To mark these items as fully passed, the user must provide or execute the following:

1. **`J18` (Live Gemini API Key for Unmocked Integration Test):**
   - **What is needed:** Add your genuine Google Gemini API key to `backend/.env`:
     ```env
     GEMINI_API_KEY=AIzaSy...your_actual_key...
     ```
   - *Note: Never paste your API key into the chat. Add it directly to your local `backend/.env` file.*
2. **`M1` (ShadowFox Assignment Document):**
   - **What is needed:** If ShadowFox provided a specific assignment PDF or document with submission deadlines, required video lengths, or report templates, provide the document or confirm that the standard technical deliverables (GitHub repository, README, and verification suite) satisfy the internship requirement.
3. **`M2` (Live Remote Deployment URL):**
   - **What is needed:** Deploy the repository to Railway or Render using the step-by-step instructions in `docs/launch-ready.md` and provide the live URL (e.g. `https://documind-production.up.railway.app`) for browser verification.

---

## 4. Intentional Deviations Catalog

Please review and confirm each of the following intentional design decisions:

1. **Brand Accent Evolution (Forest Pine vs Indigo):**
   - *Original Spec:* Indigo `#4F46E5`.
   - *Current Implementation:* Scholarly Forest Pine (`#1B4332` Light / `#40916C` Dark) with Warm Ember (`#9C381E`) citation chips.
   - *Reason:* Distinguishes DocuMind AI from generic SaaS wrappers; provides scholarly reading room aesthetics and high contrast.
2. **Settings Architecture Split (`/workspace/settings` vs `/system`):**
   - *Original Spec:* Single developer diagnostics page.
   - *Current Implementation:* End-user preferences (Appearance, Session Token, Data Export, Purge) in `/workspace/settings`; deep technical telemetry (Models, Chunks, Vector Cosine Threshold, Latency Probe) in `/system`.
   - *Reason:* End users should not be confronted with database loopback latencies or cosine distances in their preferences.
3. **Sidebar Layout Restraint:**
   - *Original Spec:* 7 items in sidebar (New workspace, Overview, Documents, AI Research, Recent activity, Settings).
   - *Current Implementation:* 4 core destinations (Home, Document Library, Research Desk, Settings), with "New workspace" housed in the workspace switcher dropdown and "Recent activity" on the Home overview page.
   - *Reason:* Avoids cluttering the sidebar with redundant routes.
4. **Sample Paper Copyright Attribution:**
   - *Original Spec:* Labelled as "Public Domain".
   - *Current Implementation:* Vaswani et al. (2017), *Attention Is All You Need*, arXiv:1706.03762 under arXiv non-exclusive scholarly fair-use license.
   - *Reason:* Honest attribution; Vaswani et al. is copyrighted and not in the public domain.

---

## 5. Implementation Sequence (Post-Approval)

Upon receiving user approval, repairs will proceed across three self-contained phases:
1. **Phase C1 (Backend & API Fixes):** Implement `GET /api/workspaces/{id}/documents`, calibrate `RAG_SYSTEM_PROMPT` (8 rules + output format), run pytest suite (43/43).
2. **Phase C2 (Frontend Repairs):** Add pre-footer CTA on landing page (`A8`), add canvas "Clear conversation" button (`D6`), update `e2e.test.js` selector.
3. **Phase C3 (Documentation Expansion):** Restructure `README.md` to feature all 23 explicit numbered sections with architecture diagrams and unmocked screenshots.

