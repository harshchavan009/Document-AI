import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Sparkles,
  Upload,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Database,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../api/client";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";

export function OverviewPage() {
  const { activeWorkspace } = useWorkspace();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!activeWorkspace) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getDocuments(activeWorkspace.id);
        if (isMounted) {
          setDocuments(res.documents || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load documents");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeWorkspace]);

  // Compute metrics from actual stored data
  const totalDocs = documents.length;
  const readyDocs = documents.filter((d) => d.status === "Ready").length;
  const totalChunks = documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0);
  const totalPages = documents.reduce((sum, d) => sum + (d.page_count || 0), 0);
  const totalBytes = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Workspace Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
            {activeWorkspace?.name || "Workspace Overview"}
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            {activeWorkspace?.description || "Document intelligence workspace for research and source-grounded answers."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/workspace/documents">
            <Button size="sm" variant="secondary" icon={Upload}>
              Upload Files
            </Button>
          </Link>
          <Link to="/workspace/research">
            <Button size="sm" icon={Sparkles}>
              AI Research
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Computed Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-lg border border-border bg-surface space-y-1">
          <div className="text-[11px] font-mono text-content-muted uppercase">Indexed Documents</div>
          <div className="text-xl sm:text-2xl font-extrabold text-content-primary">
            {totalDocs}
          </div>
          <div className="text-[11px] text-content-secondary font-mono">
            {readyDocs} ready for research
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface space-y-1">
          <div className="text-[11px] font-mono text-content-muted uppercase">Extracted Pages</div>
          <div className="text-xl sm:text-2xl font-extrabold text-content-primary">
            {totalPages}
          </div>
          <div className="text-[11px] text-content-secondary font-mono">
            Page-tracked in SQLite
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface space-y-1">
          <div className="text-[11px] font-mono text-content-muted uppercase">Vector Chunks</div>
          <div className="text-xl sm:text-2xl font-extrabold text-content-primary">
            {totalChunks}
          </div>
          <div className="text-[11px] text-content-secondary font-mono">
            Indexed in ChromaDB
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface space-y-1">
          <div className="text-[11px] font-mono text-content-muted uppercase">Total File Size</div>
          <div className="text-xl sm:text-2xl font-extrabold text-content-primary">
            {formatSize(totalBytes)}
          </div>
          <div className="text-[11px] text-content-secondary font-mono">
            Persistent disk storage
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-content-primary">Recent Documents</h2>
          <Link
            to="/workspace/documents"
            className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} />
        ) : error ? (
          <div className="p-4 rounded-md bg-semantic-error-bg border border-semantic-error-border text-semantic-error-text text-xs">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            title="No documents uploaded yet"
            description="Upload your first PDF or TXT document to begin indexing and research."
            actionLabel="Go to Document Library"
            onAction={() => (window.location.href = "/workspace/documents")}
          />
        ) : (
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <div className="divide-y divide-border">
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-subtle/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-accent shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-content-primary truncate">
                        {doc.filename}
                      </p>
                      <p className="text-[11px] font-mono text-content-muted">
                        {formatSize(doc.file_size)} • {doc.page_count} pages • {doc.chunk_count} chunks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <StatusBadge status={doc.status} errorMessage={doc.error_message} />
                    <Link
                      to="/workspace/research"
                      className="text-xs text-content-secondary hover:text-content-primary px-2 py-1 rounded hover:bg-surface-subtle transition-colors"
                    >
                      Research
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

