import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Download,
  RefreshCw,
  Info,
  Calendar,
  Hash,
  Layers,
  FileCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "../api/client";
import { StatusDot } from "../components/ui/StatusDot";
import { Button } from "../components/ui/Button";
import { DocumentReader } from "../components/documents/DocumentReader";
import { usePageMeta } from "../hooks/usePageMeta";

export function DocumentViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);

  usePageMeta(
    document?.filename ? `${document.filename} | DocuMind AI` : "Document Viewer",
    "Inspect indexed document contents and page excerpts."
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchDoc() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await api.getDocument(id);
        if (isMounted) {
          setDocument(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load document metadata.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDoc();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const handleAskAI = () => {
    if (!document) return;
    navigate(`/workspace/research?docId=${document.id}`);
  };

  const handleReprocess = async () => {
    if (!document || reprocessing) return;
    try {
      setReprocessing(true);
      await api.reprocessDocument(document.id);
      const updated = await api.getDocument(document.id);
      setDocument(updated);
    } catch (err) {
      alert("Failed to reprocess: " + (err.message || "Unknown error"));
    } finally {
      setReprocessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-canvas text-content-muted">
        <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
        <span className="text-xs font-mono">Loading document...</span>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-canvas text-center">
        <AlertCircle className="w-10 h-10 text-semantic-error-text mb-3" />
        <h2 className="text-base font-semibold text-content-primary">Document Not Found</h2>
        <p className="text-xs text-content-secondary mt-1 max-w-sm">
          {error || "The requested document could not be retrieved from this workspace."}
        </p>
        <Link
          to="/workspace/documents"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Documents</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-canvas">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0 gap-4">
        {/* Left: Navigation and Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors shrink-0"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded bg-accent-subtle/50 border border-accent/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-semibold text-content-primary truncate">
                {document.filename}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-content-muted">
                <StatusDot status={document.status} label={document.status} size="sm" />
                <span>•</span>
                <span className="tabular-nums">{document.page_count || 1} pages</span>
                <span>•</span>
                <span className="tabular-nums">{formatFileSize(document.file_size)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMetadata((v) => !v)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-content-secondary"
            title="Toggle document metadata"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Metadata</span>
          </Button>

          <a
            href={api.getDocumentFileUrl(document.id)}
            download={document.filename}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-content-secondary hover:bg-surface-subtle border border-border transition-colors"
            title="Download original file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReprocess}
            disabled={reprocessing}
            className="hidden lg:inline-flex items-center gap-1.5 text-xs"
            title="Re-chunk and re-embed document"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reprocessing ? "animate-spin" : ""}`} />
            <span>Reprocess</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAskAI}
            className="inline-flex items-center gap-1.5 text-xs shadow-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Ask AI About Document</span>
            <span className="sm:hidden">Ask AI</span>
          </Button>
        </div>
      </header>

      {/* Main Body: Document Content & Optional Metadata Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Document Reader */}
        <main className="flex-1 overflow-hidden relative">
          <DocumentReader
            documentId={document.id}
            initialPage={1}
            className="h-full"
          />
        </main>

        {/* Metadata Inspector Drawer */}
        {showMetadata && (
          <aside
            tabIndex={0}
            role="region"
            aria-label="Document Details and Metadata"
            className="w-72 border-l border-border bg-surface p-4 flex flex-col gap-4 overflow-y-auto shrink-0 animate-in slide-in-from-right duration-150 focus:outline-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-semibold text-content-primary">Document Details</h3>
              <button
                type="button"
                onClick={() => setShowMetadata(false)}
                className="text-xs text-content-muted hover:text-content-primary"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider block mb-1">
                  File Name
                </span>
                <span className="font-medium text-content-primary break-all">
                  {document.filename}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider block mb-1">
                  Document ID
                </span>
                <span className="font-mono text-[11px] text-content-secondary break-all select-all">
                  {document.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                <div>
                  <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider block">
                    Pages
                  </span>
                  <span className="font-semibold text-content-primary tabular-nums">
                    {document.page_count || 1}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider block">
                    Chunks
                  </span>
                  <span className="font-semibold text-content-primary tabular-nums">
                    {document.chunk_count || 0}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                <div>
                  <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider block">
                    Size
                  </span>
                  <span className="text-content-primary tabular-nums">
                    {formatFileSize(document.file_size)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider block">
                    Format
                  </span>
                  <span className="text-content-primary font-mono text-[11px]">
                    {document.file_type}
                  </span>
                </div>
              </div>

              {document.file_hash && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider block mb-1">
                    SHA-256 Digest
                  </span>
                  <span className="font-mono text-[10px] text-content-muted break-all select-all">
                    {document.file_hash}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-border/50">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider block mb-1">
                  Uploaded
                </span>
                <span className="text-content-secondary text-[11px]">
                  {formatDate(document.created_at)}
                </span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

