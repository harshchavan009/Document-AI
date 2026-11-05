// DocuMind AI Frontend API Client

const BASE_URL = "/api";

export class ApiError extends Error {
  constructor(message, status, code = "API_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function getSessionToken() {
  let token = localStorage.getItem("dm_session_token");
  if (!token) {
    token = "dm_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("dm_session_token", token);
  }
  return token;
}

function authFetch(url, options = {}) {
  const headers = {
    "X-Session-ID": getSessionToken(),
    ...(options.headers || {}),
  };
  return fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let errorCode = "UNKNOWN_ERROR";
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = errJson.detail;
      } else if (errJson.error && errJson.error.message) {
        errorDetail = errJson.error.message;
        errorCode = errJson.error.code || errorCode;
      }
    } catch {
      // Non-JSON error body
    }
    throw new ApiError(errorDetail, response.status, errorCode);
  }
  return await response.json();
}

export const api = {
  // System and Runtime Configuration
  async getConfig() {
    const res = await authFetch(`${BASE_URL}/config`);
    return handleResponse(res);
  },

  async getHealth() {
    const res = await authFetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  // Workspaces
  async getWorkspaces() {
    const res = await authFetch(`${BASE_URL}/workspaces`);
    return handleResponse(res);
  },

  async createWorkspace(name, description = "") {
    const res = await authFetch(`${BASE_URL}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(res);
  },

  async deleteWorkspace(workspaceId) {
    const res = await authFetch(`${BASE_URL}/workspaces/${workspaceId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  // Documents
  async getDocuments(workspaceId, statusFilter = "", search = "") {
    let url = `${BASE_URL}/documents?workspace_id=${encodeURIComponent(workspaceId)}`;
    if (statusFilter) url += `&status_filter=${encodeURIComponent(statusFilter)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await authFetch(url);
    return handleResponse(res);
  },

  async getDocument(documentId) {
    const res = await authFetch(`${BASE_URL}/documents/${documentId}`);
    return handleResponse(res);
  },

  getDocumentFileUrl(documentId) {
    return `${BASE_URL}/documents/${documentId}/file`;
  },

  async getDocumentStatus(documentId) {
    const res = await authFetch(`${BASE_URL}/documents/${documentId}/status`);
    return handleResponse(res);
  },

  uploadDocuments(workspaceId, files, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("workspace_id", workspaceId);

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percent: Math.round((event.loaded / event.total) * 100),
          });
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const parsed = JSON.parse(xhr.responseText);
              resolve(parsed);
            } catch {
              resolve({ uploaded: [], rejected: [] });
            }
          } else {
            let errorMsg = `Upload failed with status ${xhr.status}`;
            try {
              const errParsed = JSON.parse(xhr.responseText);
              if (errParsed.detail) errorMsg = errParsed.detail;
            } catch {
              // Ignore parse error
            }
            reject(new ApiError(errorMsg, xhr.status, "UPLOAD_FAILED"));
          }
        }
      };

      xhr.onerror = () => {
        reject(new ApiError("Network error during file upload", 0, "NETWORK_ERROR"));
      };

      xhr.open("POST", `${BASE_URL}/documents/upload`);
      xhr.setRequestHeader("X-Session-ID", getSessionToken());
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  },

  async ingestSampleDocument(workspaceId) {
    const formData = new FormData();
    formData.append("workspace_id", workspaceId);
    const res = await authFetch(`${BASE_URL}/documents/sample`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteDocument(documentId) {
    const res = await authFetch(`${BASE_URL}/documents/${documentId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  async reprocessDocument(documentId) {
    const res = await authFetch(`${BASE_URL}/documents/${documentId}/reprocess`, {
      method: "POST",
    });
    return handleResponse(res);
  },

  // Chat and RAG Research
  async queryChat(workspaceId, question, documentIds = null, sessionId = null, topK = 5) {
    const res = await authFetch(`${BASE_URL}/chat/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: workspaceId,
        question,
        document_ids: documentIds,
        session_id: sessionId,
        top_k: topK,
      }),
    });
    return handleResponse(res);
  },

  async streamQueryChat(
    workspaceId,
    question,
    documentIds = null,
    sessionId = null,
    topK = 5,
    onEvent,
    onError,
    onDone,
    signal = null
  ) {
    try {
      const response = await authFetch(`${BASE_URL}/chat/query/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: signal || undefined,
        body: JSON.stringify({
          workspace_id: workspaceId,
          question,
          document_ids: documentIds,
          session_id: sessionId,
          top_k: topK,
        }),
      });

      if (!response.ok) {
        const err = await handleResponse(response);
        throw new Error(err.message || "Streaming failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/^event:\s*(\w+)/m);
          const dataMatch = block.match(/^data:\s*(.*)$/m);

          if (eventMatch && dataMatch) {
            const eventName = eventMatch[1];
            try {
              const parsedData = JSON.parse(dataMatch[1]);
              if (onEvent) onEvent(eventName, parsedData);
            } catch {
              if (onEvent) onEvent(eventName, dataMatch[1]);
            }
          }
        }
      }

      if (onDone) onDone();
    } catch (err) {
      if (err.name === "AbortError") {
        if (onDone) onDone();
        return;
      }
      if (onError) onError(err);
    }
  },

  async getSuggestedQuestions(workspaceId, documentIds = null) {
    const res = await authFetch(`${BASE_URL}/chat/suggested-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: workspaceId,
        document_ids: documentIds && documentIds.length > 0 ? documentIds : null,
      }),
    });
    return handleResponse(res);
  },

  async getChatSessions(workspaceId) {
    const res = await authFetch(`${BASE_URL}/chat/sessions?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  async getChatSession(sessionId) {
    const res = await authFetch(`${BASE_URL}/chat/sessions/${sessionId}`);
    return handleResponse(res);
  },

  async deleteChatSession(sessionId) {
    const res = await authFetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};
