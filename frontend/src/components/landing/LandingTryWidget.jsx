import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
} from "lucide-react";
import { api } from "../../api/client";
import { Button } from "../ui/Button";

export function LandingTryWidget({ config }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState("sample"); // "sample" | "upload"
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState(
    "What is the primary advantage of multi-head self-attention?"
  );
  const [processing, setProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [error, setError] = useState(null);

  const allowedExtensions = config?.allowed_extensions || [".pdf", ".txt"];
  const maxMb = config?.max_file_size_mb || 20;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setMode("upload");
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setMode("upload");
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setProcessing(true);
    setError(null);
    setProgressStage("Connecting to research workspace...");

    try {
      // 1. Get or create active workspace
      const wsRes = await api.getWorkspaces().catch(() => ({ workspaces: [] }));
      let workspace = wsRes.workspaces?.[0];
      if (!workspace) {
        workspace = await api.createWorkspace("My Research Workspace");
      }

      let targetDocId = null;

      if (mode === "sample") {
        setProgressStage("Loading sample paper (Vaswani et al., 2017)...");
        const ingestRes = await api.ingestSampleDocument(workspace.id);
        targetDocId = ingestRes.id || ingestRes.document?.id;
      } else if (file) {
        setProgressStage(`Uploading ${file.name}...`);
        const uploadRes = await api.uploadFiles(workspace.id, [file]);
        if (uploadRes.rejected && uploadRes.rejected.length > 0) {
          throw new Error(uploadRes.rejected[0].reason || "File upload was rejected");
        }
        targetDocId = uploadRes.uploaded?.[0]?.id;
      } else {
        throw new Error("Please select a document or use the sample paper.");
      }

      if (!targetDocId) {
        throw new Error("Document processing could not be initialized.");
      }

      // 2. Poll until pipeline state is Ready
      let pollAttempts = 0;
      const maxAttempts = 30;
      let ready = false;

      while (pollAttempts < maxAttempts && !ready) {
        pollAttempts++;
        const docRes = await api.getDocument(targetDocId);
        const doc = docRes.document || docRes;

        if (doc?.status === "Ready") {
          ready = true;
          break;
        } else if (doc?.status === "Failed") {
          throw new Error(doc?.error_message || "Document extraction failed.");
        } else if (doc?.status) {
          setProgressStage(`Pipeline: ${doc.status}...`);
        }

        await new Promise((r) => setTimeout(r, 800));
      }

      setProgressStage("Document indexed. Opening research canvas...");
      navigate(`/workspace/research?docId=${targetDocId}&q=${encodeURIComponent(query)}`);
    } catch (err) {
      console.error("Interactive onboarding error:", err);
      setError(err.message || "Failed to process document. Please try again.");
      setProcessing(false);
      setProgressStage("");
    }
  };

  return (
    <div className="rounded-[8px] border border-border bg-surface p-4 sm:p-5 shadow-sm text-left">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="font-semibold text-content-primary text-xs tracking-tight">
            Try DocuMind Instantly
          </span>
        </div>
        <span className="text-[11px] text-content-muted">
          Real live pipeline
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-subtle border border-border rounded-[6px]">
          <button
            type="button"
            onClick={() => {
              setMode("sample");
              setError(null);
            }}
            className={`py-1.5 px-3 rounded-[4px] text-xs font-medium transition-colors text-center cursor-pointer ${
              mode === "sample"
                ? "bg-surface text-content-primary border border-border/80 shadow-xs"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            Sample Paper (arXiv)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("upload");
              if (!file && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={`py-1.5 px-3 rounded-[4px] text-xs font-medium transition-colors text-center cursor-pointer ${
              mode === "upload"
                ? "bg-surface text-content-primary border border-border/80 shadow-xs"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            Upload Your File
          </button>
        </div>

        {/* Selected Document Info / Drop Target */}
        {mode === "sample" ? (
          <div className="p-3 rounded-[6px] border border-border bg-canvas text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold text-content-primary">
              <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">Attention Is All You Need</span>
            </div>
            <p className="text-[11px] text-content-secondary">
              Vaswani et al. (2017). The foundational Transformer architecture paper.
            </p>
            <div className="text-[10px] text-content-muted pt-0.5">
              arXiv:1706.03762. Educational demonstration.
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-[6px] border border-dashed border-border hover:border-accent/60 bg-canvas hover:bg-surface transition-colors cursor-pointer text-center text-xs space-y-1"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedExtensions.join(",")}
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 font-medium text-content-primary">
                <FileText className="w-4 h-4 text-accent" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-[10px] text-content-muted">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ) : (
              <>
                <Upload className="w-4 h-4 mx-auto text-content-muted" />
                <p className="font-medium text-content-primary">
                  Click or drag a PDF or TXT file here
                </p>
                <p className="text-[10px] text-content-muted">
                  Up to {maxMb} MB and 50 pages per document
                </p>
              </>
            )}
          </div>
        )}

        {/* Inquiry Prompt Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="landing-question-input"
            className="block text-xs font-medium text-content-secondary"
          >
            Question to ask:
          </label>
          <input
            id="landing-question-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a research question..."
            disabled={processing}
            className="w-full h-9 px-3 rounded-[6px] border border-border bg-surface text-content-primary text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-2.5 rounded-[5px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs space-y-1.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">{error}</div>
            </div>
            <div className="pl-5 pt-0.5">
              <button
                type="button"
                onClick={() => navigate("/workspace")}
                className="text-[11px] underline font-medium hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
              >
                Open workspace anyway
              </button>
            </div>
          </div>
        )}

        {/* Action Button & Live Pipeline Progress */}
        <div className="space-y-2 pt-1">
          <Button
            type="submit"
            className="w-full justify-center"
            disabled={processing || !query.trim()}
            icon={processing ? Loader2 : ArrowRight}
          >
            {processing ? progressStage || "Processing..." : "Ask Question & Open Workspace"}
          </Button>

          <p className="text-[10px] text-content-muted text-center leading-relaxed">
            Data is strictly isolated to your visitor session and auto-deleted after 7 days.
          </p>
        </div>
      </form>
    </div>
  );
}
