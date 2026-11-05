import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../api/client";
import { UploadDropZone } from "../components/ui/UploadDropZone";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { DocumentPreviewModal } from "../components/documents/DocumentPreviewModal";

export function DocumentsPage() {
  const { activeWorkspace } = useWorkspace();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDocs, setSelectedDocs] = useState(new Set());

  // Preview state
  const [previewDocId, setPreviewDocId] = useState(null);

  const fetchDocs = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      setError(null);
      const res = await api.getDocuments(activeWorkspace.id, statusFilter, search);
      setDocuments(res.documents || []);
    } catch (err) {
      setError(err.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace, statusFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchDocs();
  }, [fetchDocs]);

  // Real-time polling for in-progress documents
  useEffect(() => {
    const inProgress = documents.some((d) =>
      ["uploaded", "extracting", "chunking", "generating embeddings", "indexing"].includes(
        d.status.toLowerCase()
      )
    );

    if (!inProgress) return;

    const timer = setInterval(() => {
      fetchDocs();
    }, 2500);

    return () => clearInterval(timer);
  }, [documents, fetchDocs]);

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to permanently delete this document and all its indexed vectors?")) {
      return;
    }
    try {
      await api.deleteDocument(docId);
      setSelectedDocs((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
      fetchDocs();
    } catch (err) {
      alert("Failed to delete document: " + err.message);
    }
  };

  const handleReprocess = async (docId) => {
    try {
      await api.reprocessDocument(docId);
      fetchDocs();
    } catch (err) {
      alert("Failed to reprocess: " + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocs.size === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedDocs.size} selected document(s)?`
      )
    ) {
      return;
    }
    for (const docId of Array.from(selectedDocs)) {
      try {
        await api.deleteDocument(docId);
      } catch (err) {
        console.error("Failed to delete doc:", docId, err);
      }
    }
    setSelectedDocs(new Set());
    fetchDocs();
  };

  const toggleSelectAll = () => {
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(documents.map((d) => d.id)));
    }
  };

  const toggleSelectOne = (docId) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-content-primary">
          Document Library
        </h1>
        <p className="text-xs text-content-secondary mt-1">
          Upload and manage your research documents. Monitored through real asynchronous indexing stages.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadDropZone onUploadComplete={() => fetchDocs()} />

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-content-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-surface border border-border rounded-md text-content-primary placeholder:text-content-muted focus:outline-none focus:border-accent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 text-xs bg-surface border border-border rounded-md text-content-secondary focus:outline-none focus:border-accent"
          >
            <option value="">All Statuses</option>
            <option value="Ready">Ready</option>
            <option value="Indexing">Indexing</option>
            <option value="Extracting">Extracting</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {selectedDocs.size > 0 && (
          <Button
            size="sm"
            variant="destructive"
            icon={Trash2}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedDocs.size})
          </Button>
        )}
      </div>

      {/* Document Table */}
      {loading ? (
        <SkeletonLoader count={4} />
      ) : error ? (
        <div className="p-4 rounded-md bg-semantic-error-bg border border-semantic-error-border text-semantic-error-text text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title={search ? "No matching documents" : "Document library is empty"}
          description={
            search
              ? "Try adjusting your search query or clearing the status filter."
              : "Drag and drop PDF or TXT files above to add them to this workspace."
          }
        />
      ) : (
        <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-[11px] font-mono text-content-muted uppercase">
                  <th className="py-2.5 px-3 w-8">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-content-muted hover:text-content-primary"
                    >
                      {selectedDocs.size === documents.length ? (
                        <CheckSquare className="w-4 h-4 text-accent" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3 font-semibold">Filename</th>
                  <th className="py-2.5 px-3 font-semibold">Size</th>
                  <th className="py-2.5 px-3 font-semibold">Pages</th>
                  <th className="py-2.5 px-3 font-semibold">Chunks</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((doc) => {
                  const isSelected = selectedDocs.has(doc.id);

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-surface-subtle/50 transition-colors ${
                        isSelected ? "bg-accent-subtle/20" : ""
                      }`}
                    >
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(doc.id)}
                          className="text-content-muted hover:text-content-primary"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-accent" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent shrink-0" />
                          <span className="font-medium text-content-primary truncate">
                            {doc.filename}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-content-secondary whitespace-nowrap">
                        {formatSize(doc.file_size)}
                      </td>

                      <td className="py-3 px-3 font-mono text-content-secondary whitespace-nowrap">
                        {doc.page_count}
                      </td>

                      <td className="py-3 px-3 font-mono text-content-secondary whitespace-nowrap">
                        {doc.chunk_count}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge
                          status={doc.status}
                          errorMessage={doc.error_message}
                        />
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewDocId(doc.id)}
                            className="p-1 rounded hover:bg-surface text-content-secondary hover:text-content-primary"
                            title="Preview Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReprocess(doc.id)}
                            className="p-1 rounded hover:bg-surface text-content-secondary hover:text-content-primary"
                            title="Reprocess Document"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id)}
                            className="p-1 rounded hover:bg-surface text-semantic-error-text hover:bg-semantic-error-bg"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Document Preview */}
      {previewDocId && (
        <DocumentPreviewModal
          documentId={previewDocId}
          onClose={() => setPreviewDocId(null)}
        />
      )}
    </div>
  );
}
