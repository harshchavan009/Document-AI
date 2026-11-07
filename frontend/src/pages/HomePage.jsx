import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  Sparkles,
  ArrowRight,
  Upload,
  Clock,
  MessageSquare,
  AlertCircle,
  FileCheck,
  ChevronRight,
  BookOpen,
  Filter,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../api/client";
import { StatusDot } from "../components/ui/StatusDot";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { usePageMeta } from "../hooks/usePageMeta";

export function HomePage() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  usePageMeta("Workspace", "Explore documents and query knowledge in your research workspace.");

  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ingestingSample, setIngestingSample] = useState(false);

  // Drag and drop state for empty workspace
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Fetch real data from backend
  const loadWorkspaceData = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      setError(null);
      const [docsRes, sessRes, cfgRes] = await Promise.all([
        api.getDocuments(activeWorkspace.id),
        api.getChatSessions(activeWorkspace.id),
        api.getConfig(),
      ]);
      setDocuments(docsRes.documents || []);
      setSessions(sessRes || []);
      setConfig(cfgRes);
    } catch (err) {
      setError(err.message || "Failed to load workspace data");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    setLoading(true);
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  // Real-time polling for any in-flight document processing
  useEffect(() => {
    const hasActiveProcessing = documents.some((d) =>
      ["uploaded", "extracting", "chunking", "generating embeddings", "indexing"].includes(
        d.status.toLowerCase()
      )
    );
    if (!hasActiveProcessing) return;

    const interval = setInterval(() => {
      loadWorkspaceData();
    }, 2000);

    return () => clearInterval(interval);
  }, [documents, loadWorkspaceData]);

  // Handle Search or Natural Language Question submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // If query looks like a question or has multiple words, route to Research Workspace with query
    if (trimmed.includes(" ") || trimmed.endsWith("?")) {
      navigate(`/workspace/research?q=${encodeURIComponent(trimmed)}`);
    } else {
      // If single token, search documents library
      navigate(`/workspace/documents?search=${encodeURIComponent(trimmed)}`);
    }
  };

  // Handle Ingest Sample Document
  const handleIngestSample = async () => {
    if (!activeWorkspace) return;
    try {
      setIngestingSample(true);
      setUploadError(null);
      await api.ingestSampleDocument(activeWorkspace.id);
      await loadWorkspaceData();
    } catch (err) {
      setUploadError(err.message || "Failed to ingest sample document");
    } finally {
      setIngestingSample(false);
    }
  };

  // Handle File Upload from Drop Zone
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);

    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length || !activeWorkspace) return;

    try {
      const res = await api.uploadDocuments(activeWorkspace.id, files);
      if (res.rejected && res.rejected.length > 0) {
        setUploadError(
          `Rejected ${res.rejected[0].filename}: ${res.rejected[0].reason}`
        );
      }
      loadWorkspaceData();
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    }
  };

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !activeWorkspace) return;
    try {
      const res = await api.uploadDocuments(activeWorkspace.id, files);
      if (res.rejected && res.rejected.length > 0) {
        setUploadError(
          `Rejected ${res.rejected[0].filename}: ${res.rejected[0].reason}`
        );
      }
      loadWorkspaceData();
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    }
  };

  const readyDocuments = documents.filter((d) => d.status.toLowerCase() === "ready");
  const inProgressDocuments = documents.filter((d) =>
    ["uploaded", "extracting", "chunking", "generating embeddings", "indexing"].includes(
      d.status.toLowerCase()
    )
  );

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
        <div className="h-10 bg-surface-subtle animate-pulse rounded-[6px]" />
        <SkeletonLoader count={4} />
      </div>
    );
  }

  // 1. EMPTY WORKSPACE STATE: Purposeful Onboarding Desk
  if (documents.length === 0) {
    const maxSize = config?.max_file_size_mb || 25;
    const allowed = (config?.allowed_extensions || [".pdf", ".txt"]).join(", ");

    return (
      <div className="p-6 sm:p-12 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-150">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            {activeWorkspace?.name || "Workspace Home"}
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto leading-relaxed">
            Upload multi-page research PDFs or technical text documents to begin building your grounded knowledge index.
          </p>
        </div>

        {uploadError && (
          <div className="p-3 bg-semantic-error-bg border border-semantic-error-border rounded-[5px] text-xs text-semantic-error-text flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Large Onboarding Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`p-10 border-2 border-dashed rounded-[8px] text-center transition-all ${
            isDragging
              ? "border-accent bg-accent-subtle/50"
              : "border-border bg-surface hover:border-border-strong"
          }`}
        >
          <div className="w-12 h-12 rounded-[6px] bg-accent-subtle text-accent mx-auto flex items-center justify-center mb-4">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-semibold text-content-primary mb-1">
            Drag and drop your research files here
          </h3>
          <p className="text-xs text-content-muted mb-4">
            Supported types: {allowed} (up to {maxSize} MB each)
          </p>

          <label className="inline-block">
            <input
              type="file"
              multiple
              accept={config?.allowed_extensions?.join(",") || ".pdf,.txt"}
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center font-medium text-xs h-8 px-4 rounded-[5px] bg-accent hover:bg-accent-hover text-accent-contrast shadow-xs transition-colors cursor-pointer">
              Choose files from computer
            </span>
          </label>
        </div>

        {/* Sample Paper Ingestion Card */}
        <div className="p-4 rounded-[6px] border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-content-primary">
                Try instantly with a sample paper
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-subtle text-content-muted border border-border">
                Public Domain
              </span>
            </div>
            <p className="text-xs text-content-secondary">
              Ingests "Attention Is All You Need" (Vaswani et al.) through the real extraction and vector indexing pipeline.
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            loading={ingestingSample}
            icon={BookOpen}
            onClick={handleIngestSample}
          >
            Load Sample Paper
          </Button>
        </div>
      </div>
    );
  }

  // 2. POPULATED WORKSPACE: Search-First Desk
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-content-primary">
            {activeWorkspace?.name || "Workspace Home"}
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            {readyDocuments.length} document{readyDocuments.length === 1 ? "" : "s"} indexed and ready for grounded research
            {inProgressDocuments.length > 0 && ` (${inProgressDocuments.length} currently processing)`}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/workspace/documents">
            <Button size="xs" variant="secondary" icon={Upload}>
              Add Files
            </Button>
          </Link>
          <Link to="/workspace/research">
            <Button size="xs" variant="primary" icon={Sparkles}>
              Open Research
            </Button>
          </Link>
        </div>
      </div>

      {/* Active In-Progress Processing Notification */}
      {inProgressDocuments.length > 0 && (
        <div className="p-3 bg-surface border border-semantic-warning-border rounded-[6px] shadow-xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <StatusDot status={inProgressDocuments[0].status} showText={false} />
            <span className="font-semibold text-content-primary truncate">
              {inProgressDocuments[0].filename}
            </span>
            <span className="text-content-secondary">
              is currently {inProgressDocuments[0].status.toLowerCase()}...
            </span>
          </div>
          <Link
            to="/workspace/documents"
            className="text-xs text-accent hover:text-accent-hover font-medium shrink-0"
          >
            View status
          </Link>
        </div>
      )}

      {/* Primary Search-First Input (Dropbox Dash / Perplexity style) */}
      <div className="space-y-2">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center bg-surface border border-border rounded-[8px] shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all"
        >
          <Search className="w-5 h-5 text-content-muted ml-3.5 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question across your documents or search by name..."
            className="w-full h-12 px-3 text-xs sm:text-sm bg-transparent text-content-primary placeholder:text-content-muted focus:outline-none"
          />
          <button
            type="submit"
            className="mr-2 p-1.5 rounded-[5px] bg-accent hover:bg-accent-hover text-accent-contrast shadow-xs transition-colors cursor-pointer"
            title="Submit question or search"
            aria-label="Submit"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-content-muted px-1">
          <div className="flex items-center gap-1.5">
            <span>Active scope:</span>
            <span className="font-medium text-content-primary">
              All documents ({readyDocuments.length})
            </span>
          </div>
          <span>Tip: Multi-word queries stream answers directly with page citations</span>
        </div>
      </div>

      {/* Two Column Layout: Recent Documents & Recent Research Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Recent Documents */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Recent Documents
            </h2>
            <Link
              to="/workspace/documents"
              className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              <span>Library</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-surface border border-border rounded-[6px] hover:border-border-strong transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-accent shrink-0" />
                  <div className="min-w-0">
                    <Link
                      to="/workspace/documents"
                      className="font-medium text-content-primary hover:text-accent truncate block"
                    >
                      {doc.filename}
                    </Link>
                    <div className="text-[11px] text-content-muted flex items-center gap-2 tabular-nums">
                      <span>{doc.chunk_count || 0} chunks</span>
                      <span>•</span>
                      <span>Page {doc.page_count || 1}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusDot status={doc.status} errorMessage={doc.error_message} />
                  <Link
                    to={`/workspace/research?scope=${doc.id}`}
                    className="p-1 rounded text-content-muted hover:text-accent hover:bg-surface-subtle"
                    title="Ask about this document"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Research Sessions */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Recent Sessions
            </h2>
            <Link
              to="/workspace/research"
              className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              <span>All Sessions</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-[6px] bg-surface-subtle/30 text-xs text-content-muted space-y-2">
                <MessageSquare className="w-5 h-5 mx-auto text-content-muted opacity-60" />
                <p>No research sessions recorded yet.</p>
                <Link to="/workspace/research">
                  <Button size="xs" variant="secondary">
                    Start Research Session
                  </Button>
                </Link>
              </div>
            ) : (
              sessions.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  to={`/workspace/research?session=${session.id}`}
                  className="p-3 bg-surface border border-border rounded-[6px] hover:border-border-strong hover:bg-surface-subtle/40 transition-all block space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-content-primary truncate">
                      {session.title || "Research Inquiry"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-content-muted shrink-0" />
                  </div>
                  <div className="text-[11px] text-content-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(session.updated_at)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

