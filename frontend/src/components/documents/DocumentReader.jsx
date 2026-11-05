import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  AlertCircle,
  Loader2,
  Quote,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { api } from "../../api/client";

// Configure pdfjs worker locally via Vite asset URL for offline reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function DocumentReader({
  documentId,
  initialPage = 1,
  highlightExcerpt = "",
  compact = false,
  className = "",
  onPageChange,
}) {
  const [docMeta, setDocMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PDF state
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(compact ? 1.0 : 1.25);
  const [rendering, setRendering] = useState(false);
  const canvasRef = useRef(null);

  // TXT state
  const [txtContent, setTxtContent] = useState("");

  // Sync initialPage changes from parent (e.g. clicking different citations)
  useEffect(() => {
    if (initialPage && initialPage >= 1) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  // Load document binary / text
  useEffect(() => {
    let isMounted = true;

    async function loadDocument() {
      if (!documentId) return;
      try {
        setLoading(true);
        setError(null);

        const meta = await api.getDocument(documentId);
        if (!isMounted) return;
        setDocMeta(meta);

        const fileUrl = api.getDocumentFileUrl(documentId);

        const isPdf =
          meta.file_type === "application/pdf" ||
          (meta.filename && meta.filename.toLowerCase().endsWith(".pdf"));

        if (isPdf) {
          const loadingTask = pdfjsLib.getDocument(fileUrl);
          const pdf = await loadingTask.promise;
          if (!isMounted) return;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          const validInitial = Math.min(Math.max(1, initialPage), pdf.numPages);
          setCurrentPage(validInitial);
          if (onPageChange) onPageChange(validInitial, pdf.numPages);
        } else {
          const res = await fetch(fileUrl);
          const text = await res.text();
          if (!isMounted) return;
          setTxtContent(text);
          setTotalPages(1);
          setCurrentPage(1);
          if (onPageChange) onPageChange(1, 1);
        }
      } catch (err) {
        if (isMounted) {
          console.error("DocumentReader load error:", err);
          setError(err.message || "Failed to load document content.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  // Render PDF page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask = null;

    async function renderPage() {
      try {
        setRendering(true);
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        if (err.name !== "RenderingCancelledException") {
          console.error("PDF render error:", err);
        }
      } finally {
        setRendering(false);
      }
    }

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  const handlePageChange = (newPage) => {
    const clamped = Math.max(1, Math.min(totalPages, newPage));
    setCurrentPage(clamped);
    if (onPageChange) onPageChange(clamped, totalPages);
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-canvas text-content-muted ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
        <span className="text-xs font-mono">Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center bg-canvas ${className}`}>
        <AlertCircle className="w-8 h-8 text-semantic-error-text mb-2" />
        <h4 className="text-sm font-semibold text-content-primary">Failed to load document</h4>
        <p className="text-xs text-content-secondary mt-1 max-w-sm">{error}</p>
      </div>
    );
  }

  const isPdf = Boolean(pdfDoc);

  return (
    <div className={`flex flex-col h-full bg-surface-subtle overflow-hidden ${className}`}>
      {/* Reader Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface shrink-0 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
          <span className="font-medium text-content-primary truncate max-w-[180px] sm:max-w-xs">
            {docMeta?.filename || "Document"}
          </span>
        </div>

        {/* Page navigation and zoom */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isPdf && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-1 rounded hover:bg-surface-subtle text-content-secondary disabled:opacity-30 transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-content-secondary whitespace-nowrap">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-1 rounded hover:bg-surface-subtle text-content-secondary disabled:opacity-30 transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isPdf && <div className="h-3 w-px bg-border" />}

          {isPdf && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                disabled={scale <= 0.6}
                onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
                className="p-1 rounded hover:bg-surface-subtle text-content-secondary disabled:opacity-30 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-content-muted w-9 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                disabled={scale >= 2.4}
                onClick={() => setScale((s) => Math.min(2.4, s + 0.2))}
                className="p-1 rounded hover:bg-surface-subtle text-content-secondary disabled:opacity-30 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cited Excerpt Banner if passed */}
      {highlightExcerpt && (
        <div className="bg-accent-subtle/40 border-b border-accent/20 px-3 py-2 shrink-0">
          <div className="flex items-start gap-2">
            <Quote className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
                Cited Passage on Page {currentPage}
              </span>
              <p className="text-xs text-content-primary italic line-clamp-2 mt-0.5 font-reading">
                "{highlightExcerpt}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Content Viewport */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-canvas">
        {isPdf ? (
          <div className="relative shadow-md rounded border border-border bg-surface my-auto">
            {rendering && (
              <div className="absolute inset-0 bg-surface/50 backdrop-blur-xs flex items-center justify-center z-10">
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
              </div>
            )}
            <canvas ref={canvasRef} className="block max-w-full h-auto" />
          </div>
        ) : (
          <div className="max-w-2xl w-full bg-surface border border-border rounded p-6 shadow-xs font-reading text-xs sm:text-sm leading-relaxed text-content-primary whitespace-pre-wrap">
            {txtContent}
          </div>
        )}
      </div>
    </div>
  );
}

