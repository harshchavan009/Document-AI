import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Send,
  FileText,
  Copy,
  Check,
  RotateCcw,
  CheckSquare,
  Square,
  MessageSquare,
  Plus,
  Loader2,
  AlertCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../api/client";
import { CitationMarker } from "../components/ui/CitationMarker";
import { EvidenceExcerpt } from "../components/ui/EvidenceExcerpt";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { DocumentPreviewModal } from "../components/documents/DocumentPreviewModal";

export function ResearchPage() {
  const { activeWorkspace } = useWorkspace();

  // Documents state for left scoping panel
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState(new Set());

  // Conversation and chat state
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamDelta, setStreamDelta] = useState("");
  const [currentSources, setCurrentSources] = useState([]);
  const [activeCitationIndex, setActiveCitationIndex] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // Mobile layout tab: "research" | "sources" | "docs"
  const [mobileTab, setMobileTab] = useState("research");

  // Document preview modal
  const [previewTarget, setPreviewTarget] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamDelta]);

  // Load documents for scoping
  const loadDocuments = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      const res = await api.getDocuments(activeWorkspace.id);
      const readyDocs = (res.documents || []).filter((d) => d.status === "Ready");
      setDocuments(readyDocs);
      // Select all ready docs by default
      setSelectedDocIds(new Set(readyDocs.map((d) => d.id)));
    } catch (err) {
      console.error("Failed to load documents for research:", err);
    }
  }, [activeWorkspace]);

  // Load sessions
  const loadSessions = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      const list = await api.getChatSessions(activeWorkspace.id);
      setSessions(list || []);
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    loadDocuments();
    loadSessions();
  }, [loadDocuments, loadSessions]);

  // Switch session
  const switchSession = async (sId) => {
    setActiveSessionId(sId);
    setStreamDelta("");
    setCurrentSources([]);
    try {
      const detail = await api.getChatSession(sId);
      setMessages(detail.messages || []);
      // Aggregate citations from the last assistant message
      const lastAsst = [...(detail.messages || [])]
        .reverse()
        .find((m) => m.role === "assistant");
      if (lastAsst && lastAsst.citations) {
        setCurrentSources(lastAsst.citations);
      }
    } catch (err) {
      console.error("Failed to load session messages:", err);
    }
  };

  const startNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setStreamDelta("");
    setCurrentSources([]);
  };

  // Toggle document selection for scoping
  const toggleDocSelection = (id) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllDocs = () => {
    if (selectedDocIds.size === documents.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(documents.map((d) => d.id)));
    }
  };

  // Handle asking a research question
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanQ = question.trim();
    if (!cleanQ || streaming || !activeWorkspace) return;

    if (documents.length === 0) {
      alert("No indexed documents in this workspace. Please upload documents first.");
      return;
    }

    if (selectedDocIds.size === 0) {
      alert("Please select at least one document to scope your research.");
      return;
    }

    const docIdsArray = Array.from(selectedDocIds);

    // Append user message optimistically
    const userMsg = {
      id: "temp_user_" + Date.now(),
      role: "user",
      content: cleanQ,
      created_at: new Date().toISOString(),
      citations: [],
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setStreaming(true);
    setStreamDelta("");
    setCurrentSources([]);

    let fullAnswer = "";
    let validatedSources = [];
    let assignedSessionId = activeSessionId;

    await api.streamQueryChat(
      activeWorkspace.id,
      cleanQ,
      docIdsArray,
      activeSessionId,
      5,
      (event, data) => {
        if (event === "session_info" && data?.session_id) {
          assignedSessionId = data.session_id;
          setActiveSessionId(data.session_id);
        } else if (event === "text_delta" && data?.delta) {
          fullAnswer += data.delta;
          setStreamDelta(fullAnswer);
        } else if (event === "sources_verified" && data?.sources) {
          validatedSources = data.sources;
          setCurrentSources(data.sources);
        }
      },
      (err) => {
        console.error("Streaming error:", err);
        setStreaming(false);
        const errorMsg = {
          id: "temp_err_" + Date.now(),
          role: "assistant",
          content: "An error occurred while researching this question. " + (err.message || ""),
          created_at: new Date().toISOString(),
          citations: [],
        };
        setMessages((prev) => [...prev, errorMsg]);
      },
      () => {
        setStreaming(false);
        setStreamDelta("");
        const asstMsg = {
          id: "asst_" + Date.now(),
          role: "assistant",
          content: fullAnswer,
          created_at: new Date().toISOString(),
          citations: validatedSources,
        };
        setMessages((prev) => [...prev, asstMsg]);
        loadSessions();
      }
    );
  };

  const handleCopyAnswer = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleCitationClick = (citationIndex) => {
    setActiveCitationIndex(citationIndex);
    // Switch to sources tab on mobile
    setMobileTab("sources");
    const element = document.getElementById(`evidence-citation-${citationIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Render text and replace [1], [2] with interactive CitationMarker components
  const renderGroundedAnswer = (text, citations = []) => {
    if (!text) return null;

    const citationMap = {};
    citations.forEach((c) => {
      citationMap[c.citation_index] = c;
    });

    const parts = text.split(/(\[\d+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const citIdx = parseInt(match[1], 10);
        const citData = citationMap[citIdx];
        return (
          <CitationMarker
            key={index}
            index={citIdx}
            citation={citData}
            active={activeCitationIndex === citIdx}
            onClick={handleCitationClick}
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-canvas">
      {/* Mobile Tab Selector */}
      <div className="md:hidden flex border-b border-border bg-surface shrink-0 text-xs">
        <button
          type="button"
          onClick={() => setMobileTab("research")}
          className={`flex-1 py-2.5 font-medium border-b-2 text-center ${
            mobileTab === "research"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-content-secondary"
          }`}
        >
          Research Canvas
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("sources")}
          className={`flex-1 py-2.5 font-medium border-b-2 text-center ${
            mobileTab === "sources"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-content-secondary"
          }`}
        >
          Sources ({currentSources.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("docs")}
          className={`flex-1 py-2.5 font-medium border-b-2 text-center ${
            mobileTab === "docs"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-content-secondary"
          }`}
        >
          Scope ({selectedDocIds.size}/{documents.length})
        </button>
      </div>

      {/* Desktop Three-Panel Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Scoping & History */}
        <div
          className={`w-64 border-r border-border bg-surface flex flex-col shrink-0 ${
            mobileTab === "docs" ? "flex w-full" : "hidden md:flex"
          }`}
        >
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-content-primary">
              Source Scope
            </span>
            <button
              type="button"
              onClick={toggleAllDocs}
              className="text-[11px] text-accent hover:text-accent-hover font-medium"
            >
              {selectedDocIds.size === documents.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Document Checklist */}
          <div className="p-2 overflow-y-auto space-y-1 border-b border-border max-h-56">
            {documents.length === 0 ? (
              <p className="text-[11px] text-content-muted p-2 italic">
                No ready documents. Upload documents to enable scoping.
              </p>
            ) : (
              documents.map((doc) => {
                const isChecked = selectedDocIds.has(doc.id);

                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => toggleDocSelection(doc.id)}
                    className={`w-full flex items-center gap-2 p-1.5 rounded text-left text-xs transition-colors ${
                      isChecked
                        ? "bg-accent-subtle/40 text-content-primary font-medium"
                        : "hover:bg-surface-subtle text-content-secondary"
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-accent shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-content-muted shrink-0" />
                    )}
                    <span className="truncate">{doc.filename}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Session History */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-content-primary">
              Prior Sessions
            </span>
            <button
              type="button"
              onClick={startNewSession}
              className="p-1 rounded hover:bg-surface-subtle text-accent"
              title="New research session"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.length === 0 ? (
              <p className="text-[11px] text-content-muted p-2 italic">
                No saved sessions yet.
              </p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => switchSession(s.id)}
                  className={`w-full text-left p-2 rounded text-xs truncate flex items-center gap-2 ${
                    activeSessionId === s.id
                      ? "bg-accent text-white font-medium"
                      : "text-content-secondary hover:bg-surface-subtle hover:text-content-primary"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s.title || "Research Session"}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center Panel: Research Canvas */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-canvas overflow-hidden ${
            mobileTab === "research" ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 && !streaming ? (
              <div className="h-full flex items-center justify-center my-auto">
                <EmptyState
                  icon={Sparkles}
                  title="Document Research Canvas"
                  description="Ask any question grounded across your selected documents. Responses will cite real passages with page numbers."
                />
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="text-[10px] font-mono text-content-muted uppercase mb-1 px-1">
                    {msg.role === "user" ? "You" : "DocuMind Research Assistant"}
                  </div>

                  <div
                    className={`max-w-2xl rounded-lg p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-white shadow-xs"
                        : "bg-surface border border-border text-content-primary shadow-xs"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-3 font-sans">
                        <div className="whitespace-pre-wrap leading-relaxed text-[13px]">
                          {renderGroundedAnswer(msg.content, msg.citations)}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-content-muted">
                          <button
                            type="button"
                            onClick={() => handleCopyAnswer(msg.content, msg.id)}
                            className="inline-flex items-center gap-1 hover:text-content-primary transition-colors"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-semantic-success-text" />
                                <span className="text-semantic-success-text">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Answer</span>
                              </>
                            )}
                          </button>

                          {msg.citations && msg.citations.length > 0 && (
                            <span className="font-mono text-accent">
                              {msg.citations.length} verified citation(s)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* In-Flight Streaming Answer */}
            {streaming && (
              <div className="flex flex-col items-start">
                <div className="text-[10px] font-mono text-content-muted uppercase mb-1 px-1">
                  DocuMind Research Assistant (Streaming)
                </div>

                <div className="max-w-2xl w-full rounded-lg p-4 bg-surface border border-accent/40 text-content-primary text-xs sm:text-sm leading-relaxed shadow-xs">
                  {streamDelta ? (
                    <div className="whitespace-pre-wrap leading-relaxed text-[13px]">
                      {renderGroundedAnswer(streamDelta, currentSources)}
                      <span className="inline-block w-1.5 h-3.5 bg-accent ml-1 animate-pulse align-middle" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-content-muted text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span>Embedding query and retrieving document passages...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Question Composer */}
          <div className="p-4 border-t border-border bg-surface shrink-0">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
              <div className="relative flex items-center rounded-lg border border-border bg-canvas focus-within:border-accent shadow-xs">
                <textarea
                  rows={2}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask a question grounded in your selected documents (Press Enter to submit)..."
                  className="w-full p-3 pr-12 text-xs sm:text-sm bg-transparent resize-none text-content-primary placeholder:text-content-muted focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!question.trim() || streaming}
                  className="absolute right-3 p-2 rounded-md bg-accent hover:bg-accent-hover text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Submit question"
                >
                  {streaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-content-muted font-mono px-1">
                <span>
                  Scoped to {selectedDocIds.size} of {documents.length} document(s)
                </span>
                <span>Powered by Gemini 2.5 Flash</span>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel: Evidence Inspector */}
        <div
          className={`w-80 border-l border-border bg-surface flex flex-col shrink-0 ${
            mobileTab === "sources" ? "flex w-full" : "hidden md:flex"
          }`}
        >
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-content-primary">
              <BookOpen className="w-4 h-4 text-accent" />
              <span>Evidence Inspector</span>
            </div>
            <span className="text-[11px] font-mono text-content-muted">
              {currentSources.length} citation(s)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {currentSources.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-content-muted">
                <FileText className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-medium">No citations active</p>
                <p className="text-[11px] mt-1 text-content-secondary leading-relaxed">
                  When the assistant answers, verified source excerpts from your documents will appear here.
                </p>
              </div>
            ) : (
              currentSources.map((cit) => (
                <EvidenceExcerpt
                  key={cit.citation_index}
                  citation={cit}
                  active={activeCitationIndex === cit.citation_index}
                  onOpenPreview={(c) => {
                    setPreviewTarget({
                      docId: c.document_id,
                      page: c.page_number,
                      excerpt: c.excerpt,
                    });
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Target Document Preview Modal */}
      {previewTarget && (
        <DocumentPreviewModal
          documentId={previewTarget.docId}
          initialPage={previewTarget.page}
          targetExcerpt={previewTarget.excerpt}
          onClose={() => setPreviewTarget(null)}
        />
      )}
    </div>
  );
}
