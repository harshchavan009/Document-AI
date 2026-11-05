import React, { useState, useRef } from "react";
import { UploadCloud, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { api } from "../../api/client";

export function UploadDropZone({ onUploadComplete, className = "" }) {
  const { activeWorkspace, config } = useWorkspace();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const allowedExts = config?.allowed_extensions?.join(", ") || ".pdf, .txt";
  const maxMb = config?.max_file_size_mb || 20;

  const handleFiles = async (fileList) => {
    if (!activeWorkspace) {
      setErrorMsg("Please select or create a workspace first.");
      return;
    }
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setUploading(true);
    setProgress({ percentage: 0, loaded: 0, total: 0 });
    setErrorMsg(null);
    setRejectedFiles([]);

    try {
      const response = await api.uploadDocuments(
        activeWorkspace.id,
        files,
        (p) => setProgress(p)
      );

      if (response.rejected && response.rejected.length > 0) {
        setRejectedFiles(response.rejected);
      }

      if (onUploadComplete) {
        onUploadComplete(response);
      }
    } catch (err) {
      setErrorMsg(err.message || "Upload failed. Please check your network and file.");
    } finally {
      setUploading(false);
      setProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-accent bg-accent-subtle/40 scale-[0.99]"
            : "border-border hover:border-border-strong bg-surface hover:bg-surface-subtle/50"
        } ${uploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={config?.allowed_extensions?.join(",") || ".pdf,.txt"}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-md bg-accent-subtle flex items-center justify-center text-accent mb-1">
            <UploadCloud className="w-5 h-5" />
          </div>

          <h3 className="text-sm font-semibold text-content-primary">
            Upload Research Documents
          </h3>

          <p className="text-xs text-content-secondary max-w-sm">
            Drag and drop your files here, or click to browse from your device.
          </p>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-content-muted font-mono">
            <span>Supported: {allowedExts.toUpperCase()}</span>
            <span>•</span>
            <span>Up to {maxMb} MB per file</span>
          </div>
        </div>

        {uploading && progress && (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-content-secondary mb-1 font-mono">
              <span>Uploading bytes...</span>
              <span>
                {formatBytes(progress.loaded)} / {formatBytes(progress.total)} ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-150"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded-md bg-semantic-error-bg border border-semantic-error-border text-semantic-error-text flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {rejectedFiles.length > 0 && (
        <div className="mt-3 p-3 rounded-md bg-semantic-warning-bg border border-semantic-warning-border text-semantic-warning-text text-xs space-y-1">
          <p className="font-semibold">Some files could not be uploaded:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {rejectedFiles.map((rf, idx) => (
              <li key={idx}>
                <span className="font-medium">{rf.filename}</span>: {rf.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
