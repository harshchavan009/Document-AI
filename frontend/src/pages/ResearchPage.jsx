import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Sparkles,
  Send,
  Square,
  CheckSquare,
  MessageSquare,
  Plus,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  X,
  Quote,
  Upload,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../api/client";
import { CitationMarker } from "../components/ui/CitationMarker";
import { EvidenceExcerpt, SourceCard } from "../components/ui/EvidenceExcerpt";
import { Button } from "../components/ui/Button";
import { DocumentReader } from "../components/documents/DocumentReader";
import { usePageMeta } from "../hooks/usePageMeta";

export function ResearchPage() {
  const { activeWorkspace } = useWorkspace();
  const [searchParams] = useSearchParams();
  const queryDocId = searchParams.get("docId");
  const initialQuery = searchParams.get("q") || "";

  usePageMeta("Research Desk", "Ask questions and inspect grounded citations across indexed documents.");

  // Documents state for left scoping panel
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState(new Set());
  const [ingestingSample, setIngestingSample] = useState(false);

  // Conversation and chat sessions state
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState(initialQuery);

  // Streaming and active generation
  const [streaming, setStreaming] = useState(false);
  const [streamDelta, setStreamDelta] = useState("");
  const [currentSources, setCurrentSources] = useState([]);
  const [activeCitationIndex, setActiveCitationIndex] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const abortControllerRef = useRef(null);

  // Suggested questions state
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Inspector Panel (Right Zone) state: collapsed by default on clean desk
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightTab, setRightTab] = useState("passages"); // "passages" | "document"
  const [inspectedDocId, setInspectedDocId] = useState(null);
  const [inspectedPage, setInspectedPage] = useState(1);
  const [inspectedExcerpt, setInspectedExcerpt] = useState("");

  // Left Scoping Panel toggle
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);

  // Mobile layout active tab: "canvas" | "scope" | "evidence"
  const [mobileTab, setMobileTab] = useState("canvas");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const isMac =
    typeof navigator !== "undefined" &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

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
      const readyDocs = (res.documents || []).filter(
        (d) => d.status.toLowerCase() === "ready"
      );
      setDocuments(readyDocs);

      if (queryDocId) {
        setSelectedDocIds(new Set([queryDocId]));
      } else {
        setSelectedDocIds(new Set(readyDocs.map((d) => d.id)));
      }
    } catch (err) {
      console.error("Failed to load documents for research:", err);
    }
  }, [activeWorkspace, queryDocId]);

  // Load chat sessions
  const loadSessions = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      const list = await api.getChatSessions(activeWorkspace.id);
      setSessions(list || []);
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    }
  }, [activeWorkspace]);

  // Load suggested questions based on selected documents
  const loadSuggestedQuestions = useCallback(async () => {
    if (!activeWorkspace || documents.length === 0) return;
    try {
      setLoadingSuggestions(true);
      const docIdsArray = Array.from(selectedDocIds);
      const res = await api.getSuggestedQuestions(activeWorkspace.id, docIdsArray);
      if (res && res.questions) {
        setSuggestedQuestions(res.questions);
      }
    } catch (err) {
      console.warn("Could not load suggested questions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [activeWorkspace, documents.length, selectedDocIds]);

  useEffect(() => {
    loadDocuments();
    loadSessions();
  }, [loadDocuments, loadSessions]);

  useEffect(() => {
    if (documents.length > 0 && messages.length === 0) {
      loadSuggestedQuestions();
    }
  }, [documents.length, messages.length, selectedDocIds, loadSuggestedQuestions]);

  // If initial query was passed via query parameter, auto-submit once documents are ready
  useEffect(() => {
    if (initialQuery && documents.length > 0 && messages.length === 0 && !streaming) {
      handleSubmit(initialQuery);
    }
  }, [initialQuery, documents.length]);

  // Ingest sample document directly from research desk
  const handleIngestSample = async () => {
    if (!activeWorkspace) return;
    try {
      setIngestingSample(true);
      await api.ingestSampleDocument(activeWorkspace.id);
      await loadDocuments();
    } catch (err) {
      alert("Failed to load sample document: " + err.message);
    } finally {
      setIngestingSample(false);
    }
  };

  // Switch chat session
  const switchSession = async (sId) => {
    setActiveSessionId(sId);
    setStreamDelta("");
    setCurrentSources([]);
    setActiveCitationIndex(null);
    try {
      const detail = await api.getChatSession(sId);
      const msgs = detail.messages || [];
      setMessages(msgs);

      // Extract citations from the most recent assistant message
      const lastAsst = [...msgs].reverse().find((m) => m.role === "assistant");
      if (lastAsst && lastAsst.citations && lastAsst.citations.length > 0) {
        setCurrentSources(lastAsst.citations);
        setInspectedDocId(lastAsst.citations[0].document_id);
        setInspectedPage(lastAsst.citations[0].page_number || 1);
        setInspectedExcerpt(lastAsst.citations[0].excerpt || "");
        setRightPanelOpen(true);
      } else {
        setRightPanelOpen(false);
      }
    } catch (err) {
      console.error("Failed to load session messages:", err);
    }
  };

  // Start new research session
  const startNewSession = () => {
    if (streaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveSessionId(null);
    setMessages([]);
    setStreamDelta("");
    setCurrentSources([]);
    setActiveCitationIndex(null);
    setRightPanelOpen(false);
    setQuestion("");
    loadSuggestedQuestions();
  };

  // Delete chat session
  const deleteSession = async (sId, e) => {
    e.stopPropagation();
    try {
      await api.deleteChatSession(sId);
      if (activeSessionId === sId) {
        startNewSession();
      }
      loadSessions();
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  };

  // Toggle single document scoping
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

  // Toggle all documents scoping
  const toggleAllDocs = () => {
    if (selectedDocIds.size === documents.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(documents.map((d) => d.id)));
    }
  };

  // Open right panel to inspect a specific citation
  const inspectCitation = (citation, switchTab = "document") => {
    setActiveCitationIndex(citation.citation_index);
    setInspectedDocId(citation.document_id);
    setInspectedPage(citation.page_number || 1);
    setInspectedExcerpt(citation.excerpt || "");
    setRightPanelOpen(true);
    setRightTab(switchTab);
    setMobileTab("evidence");

    if (switchTab === "passages") {
      const el = document.getElementById(`evidence-citation-${citation.citation_index}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Stop current streaming generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreaming(false);
  };

  // Handle asking or submitting a research question
  const handleSubmit = async (overrideQuestion = null) => {
    const rawQ = overrideQuestion !== null ? overrideQuestion : question;
    const cleanQ = typeof rawQ === "string" ? rawQ.trim() : "";
    if (!cleanQ || streaming || !activeWorkspace) return;

    if (documents.length === 0) {
      alert("No indexed documents in this workspace. Please upload documents first.");
      return;
    }

    if (selectedDocIds.size === 0) {
      alert("Please select at least one document to scope your research query.");
      return;
    }

    const docIdsArray = Array.from(selectedDocIds);

    // Optimistically push user message
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
    setActiveCitationIndex(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let fullAnswer = "";
    let validatedSources = [];

    await api.streamQueryChat(
      activeWorkspace.id,
      cleanQ,
      docIdsArray,
      activeSessionId,
      5,
      (event, data) => {
        if (event === "session_info" && data?.session_id) {
          setActiveSessionId(data.session_id);
        } else if (event === "text_delta" && data?.delta) {
          fullAnswer += data.delta;
          setStreamDelta(fullAnswer);
        } else if (event === "sources_verified" && data?.sources) {
          validatedSources = data.sources;
          setCurrentSources(data.sources);
          if (data.sources.length > 0) {
            setInspectedDocId(data.sources[0].document_id);
            setInspectedPage(data.sources[0].page_number || 1);
            setInspectedExcerpt(data.sources[0].excerpt || "");
            setRightPanelOpen(true);
          }
        }
      },
      (err) => {
        console.error("Streaming error:", err);
        setStreaming(false);
        abortControllerRef.current = null;
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
        abortControllerRef.current = null;
        const asstMsg = {
          id: "asst_" + Date.now(),
          role: "assistant",
          content: fullAnswer,
          created_at: new Date().toISOString(),
          citations: validatedSources,
        };
        setMessages((prev) => [...prev, asstMsg]);
        loadSessions();
      },
      controller.signal
    );
  };

  const handleCopyAnswer = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Render text and replace inline citations [1], [2] with interactive footnote tokens
  const renderGroundedAnswer = (text, citations = []) => {
    if (!text) return null;

    const citationMap = {};
    (citations || []).forEach((c) => {
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
            onClick={() => {
              if (citData) {
                inspectCitation(citData, "document");
              } else {
                setActiveCitationIndex(citIdx);
              }
            }}
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Calibrated check: check if the answer is the insufficient context message
  const isInsufficientContext = (content) => {
    if (!content) return false;
    const lower = content.toLowerCase();
    return (
      lower.includes("cannot answer this question based on the provided documents") ||
      lower.includes("not enough information in the provided context") ||
      lower.includes("no relevant documents") ||
      lower.includes("insufficient context")
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-canvas">
      {/* Mobile Mode Switcher Bar */}
      <div className="lg:hidden flex border-b border-border bg-surface shrink-0 text-xs">
        <button
          type="button"
          onClick={() => setMobileTab("scope")}
          className={`flex-1 py-2.5 font-medium border-b-2 text-center transition-colors ${
            mobileTab === "scope"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-content-secondary"
          }`}
        >
          Scope ({selectedDocIds.size}/{documents.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("canvas")}
          className={`flex-1 py-2.5 font-medium border-b-2 text-center transition-colors ${
            mobileTab === "canvas"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-content-secondary"
          }`}
        >
          Research
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("evidence")}
          className={`flex-1 py-2.5 font-medium border-b-2 text-center transition-colors ${
            mobileTab === "evidence"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-content-secondary"
          }`}
        >
          Evidence ({currentSources.length})
        </button>
      </div>

      {/* Main 3-Zone Desktop Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT ZONE: Sources Scope & Prior Sessions */}
        {/* ========================================================= */}
        <div
          className={`border-r border-border bg-surface flex flex-col shrink-0 transition-all duration-200 ${
            mobileTab === "scope" ? "flex w-full" : leftPanelOpen ? "hidden lg:flex w-72" : "hidden"
          }`}
        >
          {/* Scoping Header */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="text-xs font-semibold text-content-primary">
                Sources
              </span>
              <span className="text-[11px] font-mono text-content-muted tabular-nums">
                ({selectedDocIds.size}/{documents.length})
              </span>
            </div>

            {documents.length > 0 && (
              <button
                type="button"
                onClick={toggleAllDocs}
                className="text-[11px] text-accent hover:text-accent-hover font-medium transition-colors cursor-pointer"
              >
                {selectedDocIds.size === documents.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>

          {/* Documents Checklist */}
          <div className="p-2 overflow-y-auto space-y-1 border-b border-border max-h-64">
            {documents.length === 0 ? (
              <div className="p-3 text-center space-y-2.5">
                <p className="text-[11px] text-content-muted leading-relaxed">
                  No documents ready in this workspace. Upload files or load a sample paper to begin research.
                </p>
                <div className="flex flex-col gap-1.5">
                  <Link to="/workspace/documents">
                    <Button size="xs" variant="primary" icon={Upload} className="w-full">
                      Add documents
                    </Button>
                  </Link>
                  <Button
                    size="xs"
                    variant="secondary"
                    icon={BookOpen}
                    loading={ingestingSample}
                    onClick={handleIngestSample}
                    className="w-full"
                  >
                    Try sample paper
                  </Button>
                </div>
              </div>
            ) : (
              documents.map((doc) => {
                const isChecked = selectedDocIds.has(doc.id);

                return (
                  <div
                    key={doc.id}
                    className={`w-full flex items-center justify-between gap-2 p-2 rounded-[5px] text-xs transition-colors group ${
                      isChecked
                        ? "bg-accent-subtle/50 text-content-primary font-medium"
                        : "hover:bg-surface-subtle text-content-secondary"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDocSelection(doc.id)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-accent shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-content-muted shrink-0" />
                      )}
                      <span className="truncate text-xs">{doc.filename}</span>
                    </button>

                    <Link
                      to={`/documents/${doc.id}`}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface text-content-muted hover:text-content-primary transition-opacity"
                      title="Open dedicated document viewer"
                      aria-label={`Open viewer for ${doc.filename}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Prior Sessions Header */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-content-primary">
              Prior Sessions
            </span>
            <button
              type="button"
              onClick={startNewSession}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-hover p-1 rounded hover:bg-surface-subtle transition-colors cursor-pointer"
              title="Start a new research session"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Prior Sessions List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.length === 0 ? (
              <p className="text-[11px] text-content-muted p-2 italic">
                No saved research sessions yet.
              </p>
            ) : (
              sessions.map((s) => {
                const isActive = activeSessionId === s.id;
                return (
                  <div
                    key={s.id}
                    data-testid="session-item"
                    onClick={() => switchSession(s.id)}
                    className={`group w-full text-left p-2 rounded-[5px] text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-accent-subtle text-content-primary font-semibold border-l-2 border-accent pl-2.5"
                        : "text-content-secondary hover:bg-surface-subtle hover:text-content-primary pl-3"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-accent" : "text-content-muted"}`} />
                      <span className="truncate">{s.title || "Research Session"}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => deleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface text-content-muted hover:text-semantic-error-text transition-opacity cursor-pointer"
                      title="Delete session"
                      aria-label="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER ZONE: Conversational Canvas */}
        {/* ========================================================= */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-canvas overflow-hidden ${
            mobileTab === "canvas" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Canvas Sub-Header */}
          <div className="h-10 px-4 border-b border-border bg-surface flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLeftPanelOpen((v) => !v)}
                className="hidden lg:inline-flex p-1 rounded hover:bg-surface-subtle text-content-secondary transition-colors cursor-pointer"
                title={leftPanelOpen ? "Collapse source panel" : "Expand source panel"}
                aria-label="Toggle source panel"
              >
                {leftPanelOpen ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <span className="font-medium text-content-primary truncate max-w-sm">
                {activeSessionId
                  ? sessions.find((s) => s.id === activeSessionId)?.title || "Active Research Session"
                  : "New Research Session"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRightPanelOpen((v) => !v)}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-surface-subtle text-content-secondary border border-border text-xs transition-colors cursor-pointer"
                title={rightPanelOpen ? "Hide evidence inspector" : "Show evidence inspector"}
              >
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span>Evidence ({currentSources.length})</span>
              </button>
            </div>
          </div>

          {/* Conversation Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-[74ch] mx-auto space-y-8">
              {messages.length === 0 && !streaming ? (
                /* Calm Reading Room Empty State */
                <div className="py-8 sm:py-12 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-accent-subtle/60 border border-accent/20 flex items-center justify-center mx-auto text-accent">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-serif font-semibold text-content-primary">
                      Ask a question about your documents
                    </h2>
                    <p className="text-xs text-content-secondary max-w-md mx-auto leading-relaxed">
                      Select documents on the left to begin your research. Every answer cites exact pages you can verify.
                    </p>
                  </div>

                  {/* Dynamic Suggested Questions */}
                  <div className="pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-semibold text-content-primary">
                        Questions you could ask
                      </span>
                      <button
                        type="button"
                        onClick={loadSuggestedQuestions}
                        disabled={loadingSuggestions}
                        className="inline-flex items-center gap-1 text-[11px] text-accent hover:text-accent-hover transition-colors cursor-pointer"
                        title="Generate new suggested questions"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingSuggestions ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {loadingSuggestions ? (
                      <div className="grid grid-cols-1 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-12 rounded-[5px] bg-surface border border-border animate-pulse"
                          />
                        ))}
                      </div>
                    ) : suggestedQuestions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {suggestedQuestions.map((sq, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSubmit(sq)}
                            className="w-full p-3 rounded-[5px] border border-border bg-surface hover:border-accent hover:bg-surface-subtle text-left transition-all group flex items-start gap-2.5 shadow-xs cursor-pointer"
                          >
                            <Quote className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                            <span className="text-xs text-content-primary font-medium group-hover:text-accent">
                              {sq}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-content-muted text-center py-4 italic">
                        Select documents on the left to generate grounded research questions.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Thread of Research Questions & Verified Answers */
                messages.map((msg) => {
                  const isUser = msg.role === "user";
                  const insufficient = !isUser && isInsufficientContext(msg.content);

                  return (
                    <article
                      key={msg.id}
                      className="space-y-2 border-b border-border/40 pb-6 last:border-b-0"
                    >
                      {/* Author & Timestamp */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-content-muted">
                        <span className="font-semibold text-content-secondary uppercase tracking-wider">
                          {isUser ? "Question" : "Response"}
                        </span>
                        <span>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>

                      {/* Content Body */}
                      {isUser ? (
                        <p className="text-sm sm:text-base font-medium text-content-primary leading-snug">
                          {msg.content}
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {/* Truthful Refusal Banner if Insufficient Context */}
                          {insufficient ? (
                            <div className="p-3.5 rounded-[5px] bg-semantic-warning-bg/50 border border-semantic-warning-border text-xs text-content-primary space-y-1.5">
                              <div className="flex items-center gap-1.5 font-semibold text-semantic-warning-text">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Insufficient Grounded Context</span>
                              </div>
                              <p className="leading-relaxed">
                                The selected documents do not contain enough evidence to answer this question. Citations are withheld to prevent extrapolation. Try selecting additional documents on the left or phrasing your inquiry differently.
                              </p>
                            </div>
                          ) : (
                            /* Typeset Answer in Source Serif 4 */
                            <div className="font-reading text-sm sm:text-[15px] leading-relaxed text-content-primary whitespace-pre-wrap">
                              {renderGroundedAnswer(msg.content, msg.citations)}
                            </div>
                          )}

                          {/* Sources Cited List underneath the answer */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                              <span className="text-[11px] font-mono uppercase tracking-wider text-content-muted font-semibold block">
                                Sources Cited ({msg.citations.length})
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {msg.citations.map((c) => (
                                  <SourceCard
                                    key={c.citation_index}
                                    citation={c}
                                    active={activeCitationIndex === c.citation_index}
                                    onClick={() => inspectCitation(c, "document")}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Response Actions */}
                          <div className="flex items-center justify-between pt-2 text-[11px] text-content-muted">
                            <button
                              type="button"
                              onClick={() => handleCopyAnswer(msg.content, msg.id)}
                              className="inline-flex items-center gap-1 text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
                            >
                              {copiedMsgId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-semantic-success-text" />
                                  <span className="text-semantic-success-text font-medium">Copied to clipboard</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy answer</span>
                                </>
                              )}
                            </button>

                            {msg.citations && msg.citations.length > 0 && (
                              <span className="font-mono text-accent text-[11px]">
                                {msg.citations.length} citation(s) server-verified
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}

              {/* In-Flight Streaming Assistant Response */}
              {streaming && (
                <article className="space-y-2 border-b border-border/40 pb-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] font-mono text-content-muted">
                    <span className="font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-accent" />
                      <span>Synthesizing Answer...</span>
                    </span>
                  </div>

                  <div className="font-reading text-sm sm:text-[15px] leading-relaxed text-content-primary whitespace-pre-wrap">
                    {streamDelta ? (
                      <>
                        {renderGroundedAnswer(streamDelta, currentSources)}
                        <span className="inline-block w-1.5 h-4 bg-accent ml-1 animate-pulse align-middle" />
                      </>
                    ) : (
                      <div className="p-4 rounded-[5px] bg-surface border border-border text-xs text-content-secondary flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-accent shrink-0" />
                        <span>Searching scoped embeddings and compiling verified chunks...</span>
                      </div>
                    )}
                  </div>
                </article>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Question Composer */}
          <div className="p-4 border-t border-border bg-surface shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="max-w-[74ch] mx-auto space-y-2"
            >
              <div className="relative rounded-[6px] border border-border bg-canvas focus-within:border-accent shadow-xs transition-colors">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Ask a question about the selected documents..."
                  className="w-full p-3 pr-20 text-xs sm:text-sm bg-transparent resize-none text-content-primary placeholder:text-content-muted focus:outline-none leading-relaxed font-sans"
                />

                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  {streaming ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleStopGeneration}
                      className="inline-flex items-center gap-1 text-xs py-1 px-2 text-semantic-error-text border-semantic-error-border"
                      title="Stop generation"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop</span>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!question.trim() || documents.length === 0}
                      className="inline-flex items-center gap-1 text-xs py-1.5 px-2.5 shadow-xs"
                      title="Submit question (Enter)"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Research</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Composer Footnote: Scope & Keyboard Shortcut */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-content-muted font-mono px-1 gap-1">
                <button
                  type="button"
                  onClick={() => setLeftPanelOpen(true)}
                  className="hover:text-content-primary transition-colors cursor-pointer text-left"
                >
                  Scoped to {selectedDocIds.size} of {documents.length} document(s)
                </button>
                <span className="hidden sm:inline">
                  Press Enter to send, Shift+Enter for newline
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT ZONE: Evidence Inspector & Document View */}
        {/* ========================================================= */}
        <div
          className={`border-l border-border bg-surface flex flex-col shrink-0 transition-all duration-200 ${
            mobileTab === "evidence"
              ? "flex w-full"
              : rightPanelOpen
              ? "hidden lg:flex w-96 xl:w-[420px]"
              : "hidden"
          }`}
        >
          {/* Inspector Header with Tab Switcher */}
          <div className="p-2 border-b border-border flex items-center justify-between bg-surface-subtle shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRightTab("passages")}
                className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
                  rightTab === "passages"
                    ? "bg-surface text-content-primary shadow-xs border border-border"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                Passages ({currentSources.length})
              </button>
              <button
                type="button"
                onClick={() => setRightTab("document")}
                className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
                  rightTab === "document"
                    ? "bg-surface text-content-primary shadow-xs border border-border"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                Document Page
              </button>
            </div>

            <button
              type="button"
              onClick={() => setRightPanelOpen(false)}
              className="p-1 rounded hover:bg-surface text-content-muted hover:text-content-primary transition-colors cursor-pointer"
              title="Close evidence inspector"
              aria-label="Close evidence inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Inspector Content */}
          <div className="flex-1 overflow-hidden">
            {currentSources.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-content-muted">
                <BookOpen className="w-8 h-8 mb-2 opacity-40 text-accent" />
                <h4 className="text-xs font-semibold text-content-primary">No Citations Active</h4>
                <p className="text-[11px] mt-1 text-content-secondary max-w-xs leading-relaxed">
                  Click any citation marker in an answer to inspect its original passage and page in the reader.
                </p>
              </div>
            ) : rightTab === "passages" ? (
              /* Passages Tab: Scrollable List of Evidence Excerpt Cards */
              <div className="h-full overflow-y-auto p-3 space-y-3">
                {currentSources.map((cit) => (
                  <EvidenceExcerpt
                    key={cit.citation_index}
                    citation={cit}
                    active={activeCitationIndex === cit.citation_index}
                    onOpenPreview={() => inspectCitation(cit, "document")}
                  />
                ))}
              </div>
            ) : (
              /* Document Page Tab: Embeds DocumentReader with Highlighted Excerpt */
              inspectedDocId ? (
                <DocumentReader
                  documentId={inspectedDocId}
                  initialPage={inspectedPage}
                  highlightExcerpt={inspectedExcerpt}
                  compact={true}
                  className="h-full"
                />
              ) : (
                <div className="h-full flex items-center justify-center p-6 text-center text-content-muted text-xs">
                  Select a citation above to inspect the document page.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
