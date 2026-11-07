import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  BookOpen,
  X,
  FileCode,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { api } from "../api/client";
import { StatusDot } from "../components/ui/StatusDot";
import { Button, IconButton } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { DocumentPreviewModal } from "../components/documents/DocumentPreviewModal";
import { UploadTray } from "../components/documents/UploadTray";
import { usePageMeta } from "../hooks/usePageMeta";

export function DocumentsPage() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  usePageMeta("Document Library", "Manage, inspect, and organize indexed research documents.");

  const [documents, setDocuments] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDocs, setSelectedDocs] = useState(new Set());

  // Sorting state
  const [sortKey, setSortKey] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Document preview modal state
  const [previewDocId, setPreviewDocId] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);

  // Upload tray state
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const [ingestingSample, setIngestingSample] = useState(false);

  const fileInputRef = useRef(null);

  const fetchDocs = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      setError(null);
      const res = await api.getDocuments(activeWorkspace.id);
      setDocuments(res.documents || []);
    } catch (err) {
      setError(err.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    setLoading(true);
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    api.getConfig().then(setConfig).catch(() => {});
  }, []);

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
    }, 2000);

    return () => clearInterval(timer);
  }, [documents, fetchDocs]);

  // Full-window drag and drop listeners
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      if (!isWindowDragging) setIsWindowDragging(true);
    };

    const handleDragLeave = (e) => {
      if (e.clientX === 0 && e.clientY === 0) {
        setIsWindowDragging(false);
      }
    };

    const handleWindowDrop = async (e) => {
      e.preventDefault();
      setIsWindowDragging(false);
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        await handleUploadFiles(files);
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, [activeWorkspace]);

  // Upload handler with live byte tracking
  const handleUploadFiles = async (files) => {
    if (!files.length || !activeWorkspace) return;

    const newTrayItems = files.map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      percentage: 0,
      stage: "Uploading",
      completed: false,
      failed: false,
      error: null,
    }));

    setUploadQueue((prev) => [...prev, ...newTrayItems]);

    try {
      const res = await api.uploadDocuments(
        activeWorkspace.id,
        files,
        (progress) => {
          setUploadQueue((prev) =>
            prev.map((item) =>
              files.some((f) => f.name === item.name)
                ? { ...item, percentage: progress.percentage, stage: "Uploading" }
                : item
            )
          );
        }
      );

      // Mark finished
      setUploadQueue((prev) =>
        prev.map((item) => {
          const wasRejected = (res.rejected || []).find((r) => r.filename === item.name);
          if (wasRejected) {
            return {
              ...item,
              failed: true,
              completed: false,
              error: wasRejected.reason,
            };
          }
          return { ...item, percentage: 100, completed: true, stage: "Queued" };
        })
      );

      fetchDocs();
    } catch (err) {
      setUploadQueue((prev) =>
        prev.map((item) => ({
          ...item,
          failed: true,
          error: err.message || "Upload failed",
        }))
      );
    }
  };

  // Sample document ingestion
  const handleIngestSample = async () => {
    if (!activeWorkspace) return;
    try {
      setIngestingSample(true);
      await api.ingestSampleDocument(activeWorkspace.id);
      fetchDocs();
    } catch (err) {
      alert("Failed to load sample document: " + err.message);
    } finally {
      setIngestingSample(false);
    }
  };

  // Delete document
  const handleDelete = async (docId) => {
    if (!window.confirm("Permanently delete this document and all indexed vectors?")) {
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

  // Bulk delete
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Permanently delete ${selectedDocs.size} selected document${
          selectedDocs.size === 1 ? "" : "s"
        } and all their vectors?`
      )
    ) {
      return;
    }
    try {
      for (const id of selectedDocs) {
        await api.deleteDocument(id);
      }
      setSelectedDocs(new Set());
      fetchDocs();
    } catch (err) {
      alert("Error deleting documents: " + err.message);
    }
  };

  // Reprocess
  const handleReprocess = async (docId) => {
    try {
      await api.reprocessDocument(docId);
      fetchDocs();
    } catch (err) {
      alert("Failed to reprocess: " + err.message);
    }
  };

  // Toggle Selection
  const toggleSelect = (id) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDocs.size === filteredDocuments.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocuments.map((d) => d.id)));
    }
  };

  // Sorting toggle
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Filter and sort computation
  const filteredDocuments = documents
    .filter((doc) => {
      if (search && !doc.filename.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (statusFilter === "ready" && doc.status.toLowerCase() !== "ready") {
        return false;
      }
      if (
        statusFilter === "processing" &&
        ![
          "uploaded",
          "extracting",
          "chunking",
          "generating embeddings",
          "indexing",
        ].includes(doc.status.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter === "failed" && doc.status.toLowerCase() !== "failed") {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === "filename") {
        valA = (valA || "").toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

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
      year: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150 relative">
      {/* Full-Window Drag and Drop Backdrop Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-xs border-4 border-dashed border-accent flex flex-col items-center justify-center pointer-events-none">
          <Upload className="w-12 h-12 text-accent animate-bounce mb-3" />
          <h2 className="text-lg font-bold text-content-primary">
            Drop PDF or TXT files here to add them to this workspace
          </h2>
          <p className="text-xs text-content-muted mt-1">
            Files will be validated, extracted, and vector indexed automatically.
          </p>
        </div>
      )}

      {/* Floating Upload Progress Tray */}
      <UploadTray
        uploads={uploadQueue}
        onDismiss={() => setUploadQueue([])}
      />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-content-primary">
            Document Library
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            {documents.length} document{documents.length === 1 ? "" : "s"} indexed in{" "}
            <span className="font-semibold text-content-primary">
              {activeWorkspace?.name || "Workspace"}
            </span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="secondary"
            loading={ingestingSample}
            icon={BookOpen}
            onClick={handleIngestSample}
          >
            Load Sample Paper
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={config?.allowed_extensions?.join(",") || ".pdf,.txt"}
            onChange={(e) => handleUploadFiles(Array.from(e.target.files || []))}
            className="hidden"
          />

          <Button
            size="xs"
            variant="primary"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Add Documents
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar (Notion style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-content-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter documents by filename..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-surface border border-border rounded-[5px] text-content-primary placeholder:text-content-muted focus:outline-none focus:border-accent"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-content-muted hover:text-content-primary"
              aria-label="Clear filter search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-[5px] border border-border text-xs">
          {[
            { id: "all", label: "All" },
            { id: "ready", label: "Ready" },
            { id: "processing", label: "Processing" },
            { id: "failed", label: "Failed" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-surface text-content-primary shadow-xs font-semibold"
                  : "text-content-secondary hover:text-content-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notion-Style Property Table */}
      {loading ? (
        <div className="space-y-2">
          <SkeletonLoader count={4} />
        </div>
      ) : error ? (
        <div className="p-4 bg-semantic-error-bg border border-semantic-error-border rounded-[6px] text-xs text-semantic-error-text flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            documents.length === 0
              ? "Your document library is empty"
              : "No documents match the current filter"
          }
          description={
            documents.length === 0
              ? "Drag and drop your research PDFs or text files anywhere on this page, or try our sample academic paper."
              : "Try adjusting your search keywords or clearing the status filter."
          }
          actionLabel={documents.length === 0 ? "Add Documents" : "Clear Filter"}
          actionIcon={documents.length === 0 ? Upload : undefined}
          onAction={() => {
            if (documents.length === 0) {
              fileInputRef.current?.click();
            } else {
              setSearch("");
              setStatusFilter("all");
            }
          }}
          secondaryActionLabel={documents.length === 0 ? "Load Sample Paper" : undefined}
          onSecondaryAction={documents.length === 0 ? handleIngestSample : undefined}
        />
      ) : (
        <div className="rounded-[6px] border border-border bg-surface shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-subtle/70 text-[11px] font-semibold text-content-muted select-none">
                  {/* Select All Checkbox */}
                  <th className="py-2.5 px-3 w-8">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-content-muted hover:text-content-primary cursor-pointer"
                      aria-label={
                        selectedDocs.size === filteredDocuments.length
                          ? "Deselect all documents"
                          : "Select all documents"
                      }
                    >
                      {selectedDocs.size === filteredDocuments.length ? (
                        <CheckSquare className="w-3.5 h-3.5 text-accent" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </th>

                  {/* Name */}
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-content-primary"
                    onClick={() => handleSort("filename")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      {sortKey === "filename" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Status */}
                  <th className="py-2.5 px-3 font-semibold">Status</th>

                  {/* Pages */}
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-content-primary"
                    onClick={() => handleSort("page_count")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Pages</span>
                      {sortKey === "page_count" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Chunks */}
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-content-primary"
                    onClick={() => handleSort("chunk_count")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Chunks</span>
                      {sortKey === "chunk_count" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Size */}
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-content-primary"
                    onClick={() => handleSort("file_size")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Size</span>
                      {sortKey === "file_size" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Date */}
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-content-primary"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Added</span>
                      {sortKey === "created_at" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Row Actions */}
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {filteredDocuments.map((doc) => {
                  const isSelected = selectedDocs.has(doc.id);
                  const isPdf = doc.filename.toLowerCase().endsWith(".pdf");

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-surface-subtle/50 transition-colors group ${
                        isSelected ? "bg-accent-subtle/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSelect(doc.id)}
                          className="text-content-muted hover:text-content-primary cursor-pointer"
                          aria-label={`Select document ${doc.filename}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Name with type icon */}
                      <td className="py-2.5 px-3 font-medium text-content-primary">
                        <div className="flex items-center gap-2 min-w-0">
                          {isPdf ? (
                            <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                          ) : (
                            <FileCode className="w-3.5 h-3.5 text-content-muted shrink-0" />
                          )}
                          <span
                            onClick={() => {
                              setPreviewDocId(doc.id);
                              setPreviewPage(1);
                            }}
                            className="truncate cursor-pointer hover:text-accent hover:underline"
                            title={doc.filename}
                          >
                            {doc.filename}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <StatusDot status={doc.status} errorMessage={doc.error_message} />
                      </td>

                      {/* Pages */}
                      <td className="py-2.5 px-3 tabular-nums text-content-secondary">
                        {doc.page_count || 1}
                      </td>

                      {/* Chunks */}
                      <td className="py-2.5 px-3 tabular-nums text-content-secondary">
                        {doc.chunk_count || 0}
                      </td>

                      {/* Size */}
                      <td className="py-2.5 px-3 tabular-nums text-content-secondary">
                        {formatFileSize(doc.file_size)}
                      </td>

                      {/* Added Date */}
                      <td className="py-2.5 px-3 text-content-muted text-[11px]">
                        {formatDate(doc.created_at)}
                      </td>

                      {/* Row Hover Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {doc.status.toLowerCase() === "ready" && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewDocId(doc.id);
                                setPreviewPage(1);
                              }}
                              className="p-1 rounded-[4px] hover:bg-surface-subtle text-content-muted hover:text-content-primary"
                              title="Preview in Document Viewer"
                              aria-label={`Preview document ${doc.filename}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {doc.status.toLowerCase() === "failed" && (
                            <button
                              type="button"
                              onClick={() => handleReprocess(doc.id)}
                              className="p-1 rounded-[4px] hover:bg-surface-subtle text-semantic-warning-text"
                              title="Retry Processing"
                              aria-label={`Retry processing document ${doc.filename}`}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id)}
                            className="p-1 rounded-[4px] hover:bg-surface-subtle text-content-muted hover:text-semantic-error-text"
                            title="Delete Document"
                            aria-label={`Delete document ${doc.filename}`}
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

      {/* Floating Bulk Action Bar */}
      {selectedDocs.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface border border-border shadow-floating px-4 py-2.5 rounded-[8px] flex items-center gap-4 text-xs animate-in slide-in-from-bottom-2 duration-150">
          <span className="font-semibold text-content-primary">
            {selectedDocs.size} document{selectedDocs.size === 1 ? "" : "s"} selected
          </span>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="primary"
              icon={Sparkles}
              onClick={() => {
                const ids = Array.from(selectedDocs).join(",");
                navigate(`/workspace/research?scope=${ids}`);
              }}
            >
              Ask AI about Selected
            </Button>

            <Button
              size="xs"
              variant="danger"
              icon={Trash2}
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>

            <button
              type="button"
              onClick={() => setSelectedDocs(new Set())}
              className="p-1 rounded text-content-muted hover:text-content-primary ml-1"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocId && (
        <DocumentPreviewModal
          documentId={previewDocId}
          initialPage={previewPage}
          onClose={() => setPreviewDocId(null)}
        />
      )}
    </div>
  );
}
