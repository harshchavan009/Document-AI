# Draft Legal Policies: Privacy Policy & Terms of Service

**Document:** `docs/privacy-terms-draft.md`  
**Date:** November 2026  
**Status:** DRAFT FOR OPERATOR REVIEW (Not Legal Advice)  

> **Notice:** The author and developers of this software are software engineers, not attorneys. These policy drafts accurately reflect the technical behavior of the DocuMind AI application, but must be reviewed, edited, and approved by the repository operator before publication. If you are operating or hosting this service in India or serving Indian residents, review the provisions of the **Digital Personal Data Protection Act, 2023 (DPDP Act)** regarding consent, personal data fiduciary duties, and data principal rights.

---

## 1. Privacy Policy (Draft)

**Last Updated:** November 2026  
**Operator Contact:** Harsh Chavan (`harshchavan1030@gmail.com`)  
**Product Name:** DocuMind AI (`https://github.com/harshchavan009/Document-AI`)  

### 1. Overview & Research Scope
DocuMind AI is a scholarly research tool designed for question answering over user-uploaded PDF and plain text documents. This Privacy Policy discloses the data we collect, how it is processed by cloud AI providers, how long it is stored, and your controls over your data.

### 2. Information We Collect
1. **Document Uploads:** We collect the files you explicitly upload (.pdf and .txt files). Uploaded documents are stored locally in the application storage volume to extract text and generate document embeddings.
2. **Session Identification:** We do not require accounts, passwords, or personal names. When you visit the application, the server issues a random, pseudonymous session identifier stored in an `httpOnly`, `Secure`, `SameSite=Lax` cookie (`dm_session`). This cookie is used strictly to isolate your workspaces and documents from other visitors.
3. **Research Conversations:** We store the questions you ask and the generated answers during your active session to support follow-up questions and research context.
4. **User Feedback:** If you submit feedback via the Settings modal, we collect your rating, message, and optional contact email.

### 3. Third-Party AI Data Processing (Google Gemini)
To provide semantic search and grounded answer synthesis:
- Document text chunks and user queries are transmitted via encrypted HTTPS to the **Google Gemini API** (`text-embedding-004` and `gemini-2.5-flash`).
- In accordance with Google AI Studio's terms of service for paid enterprise/developer API keys, data transmitted via the Gemini API is not used to train Google foundation models. Users should not upload confidential, trade secret, or sensitive personally identifiable information (PII).

### 4. Data Retention & Automatic Purging
- **7-Day Retention Limit:** All uploaded files, database records, and vector embeddings associated with a visitor session are automatically scheduled for permanent deletion 7 days after creation by our automated retention service.
- **Immediate Data Deletion:** You can permanently purge all of your documents, conversation history, and vector embeddings at any time by clicking **Delete All Data** in Workspace Settings.
- **Data Export:** You can download a complete ZIP archive of your documents and JSON conversation logs at any time by clicking **Download .zip** in Workspace Settings.

### 5. Cookies
DocuMind AI uses two functional cookies:
- `dm_session`: Pseudonymous session token (httpOnly) ensuring visitor document isolation.
- `dm_csrf`: Double-submit protection token defending against cross-site request forgery.
We do not use tracking cookies, advertising beacons, or third-party marketing pixels.

---

## 2. Terms of Service (Draft)

**Last Updated:** November 2026  
**Operator Contact:** Harsh Chavan (`harshchavan1030@gmail.com`)  

### 1. Acceptance of Terms
By accessing or using DocuMind AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not upload documents or use the service.

### 2. Nature of the Service
DocuMind AI is an experimental AI research assistant utilizing Retrieval-Augmented Generation (RAG). 

**Important Disclaimers:**
- **No Professional Advice:** DocuMind AI does not provide medical, legal, financial, or regulatory advice. The outputs are generated probabilistically by artificial intelligence and must not be relied upon for safety-critical decisions.
- **Verification Requirement:** You must independently verify all AI responses and citations against the original document pages before acting on any information.
- **No Guarantee of Infallibility:** While DocuMind AI employs server-side citation validation, language models may misinterpret complex nuance, formulas, or tables.

### 3. Acceptable Use Policy
You agree not to upload:
- Documents containing malware, malicious scripts, or prompt injection payloads designed to compromise service integrity.
- Materials infringing third-party copyrights, patents, or intellectual property rights.
- Illegal content or sensitive government classified records.

### 4. Limitation of Liability
To the maximum extent permitted by applicable law, DocuMind AI and its creators shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service, including data loss or reliance on AI-generated summaries.

### 5. Governing Law
These terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
