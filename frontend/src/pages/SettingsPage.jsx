import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Laptop,
  Check,
  Layers,
  Shield,
  Trash2,
  Activity,
  AlertCircle,
  Download,
  MessageSquare,
  Clock,
  Command,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { api, getSessionToken } from "../api/client";
import { Button } from "../components/ui/Button";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { usePageMeta } from "../hooks/usePageMeta";

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { activeWorkspace, workspaces, switchWorkspace, refreshWorkspaces } = useWorkspace();

  usePageMeta("Settings", "Manage workspace preferences, appearance, visitor identity, and data lifecycle.");

  const [config, setConfig] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [purging, setPurging] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const isMac =
    typeof navigator !== "undefined" &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

  useEffect(() => {
    api.getConfig().then(setConfig).catch(() => {});
  }, []);

  const handleCopySessionToken = () => {
    const token = getSessionToken();
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handlePurgeAllData = async () => {
    setPurging(true);
    try {
      await api.purgeSessionData();
      localStorage.removeItem("dm_active_workspace");
      setPurgeConfirmOpen(false);
      setPurgeSuccess(true);
      await refreshWorkspaces();
      setTimeout(() => {
        setPurgeSuccess(false);
        navigate("/workspace");
      }, 1500);
    } catch (err) {
      alert("Failed to purge data: " + (err.message || "Unknown error"));
    } finally {
      setPurging(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      await api.downloadSessionExport();
    } catch (err) {
      alert("Failed to export data: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-content-primary">
            Settings
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Manage your research desk appearance, visitor identity, and data lifecycle.
          </p>
        </div>

        <Link to="/system">
          <Button size="xs" variant="secondary" icon={Activity}>
            System Diagnostics
          </Button>
        </Link>
      </div>

      {/* Section 1: Appearance & Theme */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
            <Sun className="w-4 h-4 text-accent" />
            <span>Appearance & Theme</span>
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Choose your preferred desk lighting. Light mode is calibrated for paper reading; dark mode provides charcoal contrast.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Light */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer relative ${
              theme === "light"
                ? "bg-surface border-accent ring-1 ring-accent shadow-xs"
                : "bg-surface border-border hover:border-border-strong hover:bg-surface-subtle"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Sun className="w-4 h-4 text-accent" />
              {theme === "light" && <Check className="w-4 h-4 text-accent" />}
            </div>
            <span className="text-xs font-semibold text-content-primary block">
              Light
            </span>
            <span className="text-[11px] text-content-secondary mt-0.5 block">
              Warm paper reading palette with Forest Pine accents.
            </span>
          </button>

          {/* Dark */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer relative ${
              theme === "dark"
                ? "bg-surface border-accent ring-1 ring-accent shadow-xs"
                : "bg-surface border-border hover:border-border-strong hover:bg-surface-subtle"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Moon className="w-4 h-4 text-accent" />
              {theme === "dark" && <Check className="w-4 h-4 text-accent" />}
            </div>
            <span className="text-xs font-semibold text-content-primary block">
              Dark
            </span>
            <span className="text-[11px] text-content-secondary mt-0.5 block">
              Charcoal obsidian canvas with warm citation markers.
            </span>
          </button>

          {/* System */}
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer relative ${
              theme === "system"
                ? "bg-surface border-accent ring-1 ring-accent shadow-xs"
                : "bg-surface border-border hover:border-border-strong hover:bg-surface-subtle"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Laptop className="w-4 h-4 text-accent" />
              {theme === "system" && <Check className="w-4 h-4 text-accent" />}
            </div>
            <span className="text-xs font-semibold text-content-primary block">
              System
            </span>
            <span className="text-[11px] text-content-secondary mt-0.5 block">
              Synchronizes automatically with operating system settings.
            </span>
          </button>
        </div>
      </section>

      {/* Section 2: Active Workspace */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span>Active Workspace</span>
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Your current working container for indexed files, passage chunks, and research threads.
          </p>
        </div>

        <div className="rounded-[6px] border border-border bg-surface p-4 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-content-primary block">
                {activeWorkspace?.name || "Default Workspace"}
              </span>
              <span className="font-mono text-[11px] text-content-muted block mt-0.5 select-all">
                Workspace ID: {activeWorkspace?.id || "None"}
              </span>
            </div>
            <span className="text-[11px] text-content-muted">
              {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"} configured
            </span>
          </div>
        </div>
      </section>

      {/* Section 3: Visitor Identity & Data Lifecycle */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span>Visitor Identity & Data Lifecycle</span>
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Your research desk operates without passwords. Data is bound strictly to your cryptographic session token.
          </p>
        </div>

        <div className="rounded-[6px] border border-border bg-surface p-4 space-y-4 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block mb-1">
              Cryptographic Session Token
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-content-secondary truncate max-w-sm select-all bg-surface-subtle px-2 py-1 rounded border border-border">
                {getSessionToken()}
              </span>
              <button
                type="button"
                onClick={handleCopySessionToken}
                className="text-xs text-accent hover:underline font-medium cursor-pointer"
              >
                {copiedToken ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Retention Notice */}
          <div className="p-3 rounded-[5px] bg-surface-subtle border border-border flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-content-primary block">
                Automated Inactivity Retention Policy
              </span>
              <p className="text-[11px] text-content-secondary leading-normal">
                Guest sessions are automatically purged after {config?.data_retention_days || 7} days of inactivity. Export your research data below to preserve documents and conversations locally.
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Export */}
            <div className="p-3 rounded-[5px] border border-border bg-surface space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-content-primary block">Export Data</span>
                <p className="text-[11px] text-content-muted mt-0.5">
                  Download all uploaded files, citations, and conversation logs in a .zip archive.
                </p>
              </div>
              <Button
                variant="secondary"
                size="xs"
                onClick={handleExportData}
                loading={exporting}
                disabled={exporting}
                className="w-full inline-flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .zip</span>
              </Button>
            </div>

            {/* Feedback */}
            <div className="p-3 rounded-[5px] border border-border bg-surface space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-content-primary block">Share Feedback</span>
                <p className="text-[11px] text-content-muted mt-0.5">
                  Report an issue, suggest improvements, or ask a question directly.
                </p>
              </div>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setFeedbackModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Feedback</span>
              </Button>
            </div>

            {/* Purge */}
            <div className="p-3 rounded-[5px] border border-semantic-error-border/40 bg-semantic-error-surface/20 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-semantic-error-text block">Delete All Data</span>
                <p className="text-[11px] text-content-muted mt-0.5">
                  Permanently erase all files, vector embeddings, and conversation threads.
                </p>
              </div>
              <Button
                variant="danger"
                size="xs"
                onClick={() => setPurgeConfirmOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Data</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Keyboard Shortcuts */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
            <Command className="w-4 h-4 text-accent" />
            <span>Keyboard Shortcuts</span>
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Quick navigation and control shortcuts available throughout your research workspace.
          </p>
        </div>

        <div className="rounded-[6px] border border-border bg-surface overflow-hidden shadow-xs text-xs">
          <div className="divide-y divide-border">
            <div className="p-3 flex items-center justify-between">
              <span className="text-content-secondary">Command palette and quick search</span>
              <kbd className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-subtle border border-border text-content-primary">
                {isMac ? "⌘K" : "Ctrl+K"}
              </kbd>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-content-secondary">Submit question in Research Desk</span>
              <kbd className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-subtle border border-border text-content-primary">
                {isMac ? "⌘Enter" : "Ctrl+Enter"}
              </kbd>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-content-secondary">Dismiss modals and slide-out panels</span>
              <kbd className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-subtle border border-border text-content-primary">
                Esc
              </kbd>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Technical Details Callout */}
      <div className="p-4 rounded-[6px] border border-border bg-surface-subtle/50 text-xs flex items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-content-primary block">
            Looking for pipeline specifications and model telemetry?
          </span>
          <p className="text-[11px] text-content-secondary mt-0.5">
            Inspect active Gemini model identifiers, chunk overlap windows, cosine distance thresholds, and live database latency.
          </p>
        </div>
        <Link to="/system" className="shrink-0">
          <Button size="xs" variant="secondary" icon={ArrowRight}>
            View Diagnostics
          </Button>
        </Link>
      </div>

      {/* Purge Confirmation Modal */}
      {purgeConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="purge-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-[8px] bg-surface border border-semantic-error-border shadow-lg p-5 space-y-4">
            <div className="flex items-center gap-2 text-semantic-error-text">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 id="purge-modal-title" className="text-sm font-semibold">
                Permanently delete all research data?
              </h3>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              This action is immediate and irreversible. It will permanently remove:
            </p>
            <ul className="list-disc list-inside text-xs text-content-secondary space-y-1 font-mono text-[11px]">
              <li>All uploaded PDF and TXT files from physical disk</li>
              <li>All vector embeddings from ChromaDB</li>
              <li>All conversation threads and citation history from SQLite</li>
              <li>Your current visitor session token</li>
            </ul>
            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setPurgeConfirmOpen(false)}
                disabled={purging}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="xs"
                onClick={handlePurgeAllData}
                loading={purging}
                disabled={purging}
              >
                Yes, Delete Everything
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Success Overlay */}
      {purgeSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="p-6 rounded-[8px] bg-surface border border-border shadow-xl text-center space-y-2">
            <Check className="w-8 h-8 text-semantic-success-text mx-auto" />
            <h3 className="text-sm font-semibold text-content-primary">
              All data successfully purged
            </h3>
            <p className="text-xs text-content-secondary">
              Returning you to a fresh research workspace...
            </p>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </div>
  );
}
