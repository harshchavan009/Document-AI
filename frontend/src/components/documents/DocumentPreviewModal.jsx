import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, AlertCircle, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { api } from "../../api/client";

// Configure pdfjs worker via CDN or worker script
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export function DocumentPreviewModal({ documentId, initialPage = 1, targetExcerpt = "", onClose }) {
  const [docMeta, setDocMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PDF state
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.2);
  const canvasRef = useRef(null);

  // TXT state
  const [txtContent, setTxtContent] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadDoc() {
      try {
        setLoading(true);
        setError(null);

        const meta = await api.getDocument(documentId);
        if (!isMounted) return;
        setDocMeta(meta);

        const fileUrl = api.getDocumentFileUrl(documentId);

        if (meta.file_type === "application/pdf" || meta.filename.endsWith(".pdf")) {
          const loadingTask = pdfjsLib.getDocument(fileUrl);
          const pdf = await loadingTask.promise;
          if (!isMounted) return;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(Math.min(initialPage, pdf.numPages));
        } else {
          const res = await fetch(fileUrl);
          const text = await res.text();
          if (!isMounted) return;
          setTxtContent(text);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load document preview");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (documentId) {
      loadDoc();
    }

    return () => {
      isMounted = false;
    };
  }, [documentId, initialPage]);

  // Render PDF page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask = null;

    async function renderPage() {
      try {
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
      }
    }

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl h-full bg-surface border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-subtle shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-accent shrink-0" />
            <h3 className="text-sm font-semibold text-content-primary truncate">
              {docMeta?.filename || "Document Preview"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {pdfDoc && (
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-surface text-content-secondary disabled:opacity-40"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-content-secondary">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded hover:bg-surface text-content-secondary disabled:opacity-40"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-border mx-1" />

                <button
                  type="button"
                  onClick={() => setScale((s) => Math.min(2.0, s + 0.2))}
                  className="p-1 rounded hover:bg-surface text-content-secondary"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.max(0.8, s - 0.2))}
                  className="p-1 rounded hover:bg-surface text-content-secondary"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-surface text-content-muted hover:text-content-primary transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-canvas flex justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center my-auto text-content-muted gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span className="text-xs">Loading document preview...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-semantic-error-text bg-semantic-error-bg p-4 rounded-md border border-semantic-error-border my-auto max-w-md text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && pdfDoc && (
            <div className="shadow-lg rounded border border-border bg-white overflow-hidden my-auto">
              <canvas ref={canvasRef} className="block max-w-full" />
            </div>
          )}

          {!loading && !error && !pdfDoc && (
            <div className="w-full max-w-2xl bg-surface p-6 rounded-md border border-border font-mono text-xs leading-relaxed text-content-secondary whitespace-pre-wrap break-words">
              {targetExcerpt ? (
                <div>
                  <div className="mb-4 p-3 bg-evidence-highlight/20 border-l-2 border-accent text-content-primary font-semibold">
                    Target Excerpt: "{targetExcerpt}"
                  </div>
                  <div>{txtContent}</div>
                </div>
              ) : (
                txtContent
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
