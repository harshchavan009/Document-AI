import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Check,
  RefreshCw,
  Cpu,
  Database,
  Layers,
  Shield,
  Trash2,
  Activity,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { api, getSessionToken } from "../api/client";
import { StatusDot } from "../components/ui/StatusDot";
import { Button } from "../components/ui/Button";

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { activeWorkspace, workspaces, switchWorkspace } = useWorkspace();

  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [healthData, setHealthData] = useState(null);
  const [pingLatency, setPingLatency] = useState(null);
  const [pinging, setPinging] = useState(false);

  const [copiedToken, setCopiedToken] = useState(false);

  // Load runtime config
  const fetchRuntimeConfig = async () => {
    try {
      setLoadingConfig(true);
      const data = await api.getConfig();
      setConfig(data);
    } catch (err) {
      console.error("Failed to load runtime config:", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Test backend connection and latency
  const runHealthProbe = async () => {
    try {
      setPinging(true);
      const start = performance.now();
      const res = await api.getHealth();
      const duration = Math.round(performance.now() - start);
      setHealthData(res);
      setPingLatency(duration);
    } catch (err) {
      console.error("Health probe failed:", err);
      setHealthData({ status: "unreachable", error: err.message });
      setPingLatency(null);
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    fetchRuntimeConfig();
    runHealthProbe();
  }, []);

  const handleCopySessionToken = () => {
    const token = getSessionToken();
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleResetSession = () => {
    if (
      window.confirm(
        "Resetting your visitor identity will generate a fresh session token. Your current workspace documents will remain safely stored on the server. Proceed?"
      )
    ) {
      localStorage.removeItem("dm_session_token");
      localStorage.removeItem("dm_active_workspace");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-content-primary">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-surface px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-accent" />
            <h1 className="text-sm font-semibold text-content-primary">
              Settings & Runtime Diagnostics
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/workspace">
            <Button size="sm" variant="secondary">
              Open Workspace
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Settings Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-10">
        {/* Section 1: Appearance & Theme */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <Sun className="w-4 h-4 text-accent" />
              <span>Appearance & Color Theme</span>
            </h2>
            <p className="text-xs text-content-secondary mt-1">
              Choose your preferred desk lighting. Light mode is calibrated for deep paper reading; dark mode provides high-contrast charcoal contrast.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Light Option */}
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
                Warm Paper (Light)
              </span>
              <span className="text-[11px] text-content-secondary mt-0.5 block">
                Default research room palette with Forest Pine accents.
              </span>
            </button>

            {/* Dark Option */}
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
                Charcoal Ink (Dark)
              </span>
              <span className="text-[11px] text-content-secondary mt-0.5 block">
                Deep obsidian canvas with Warm Ember citation markers.
              </span>
            </button>

            {/* System Option */}
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
                System Synchronized
              </span>
              <span className="text-[11px] text-content-secondary mt-0.5 block">
                Follows your operating system theme preference automatically.
              </span>
            </button>
          </div>
        </section>

        {/* Section 2: Active Runtime Pipeline Configuration */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                <span>Runtime RAG Pipeline Configuration</span>
              </h2>
              <p className="text-xs text-content-secondary mt-1">
                Dynamic limits and active model identifiers reported directly by the FastAPI backend via <code className="text-[11px] font-mono px-1 py-0.5 bg-surface-subtle rounded border border-border">GET /api/config</code>.
              </p>
            </div>

            <Button
              variant="secondary"
              size="xs"
              onClick={fetchRuntimeConfig}
              disabled={loadingConfig}
              className="inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loadingConfig ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>

          <div className="rounded-[6px] border border-border bg-surface overflow-hidden shadow-xs">
            <div className="p-3 border-b border-border bg-surface-subtle flex items-center justify-between text-xs">
              <span className="font-semibold text-content-primary">Parameter Specification</span>
              <span className="text-content-muted font-mono text-[11px]">Enforced Server-Side</span>
            </div>

            <div className="divide-y divide-border text-xs">
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-content-primary block">Generation Model</span>
                  <span className="text-[11px] text-content-muted">Foundation model used for grounded answer synthesis</span>
                </div>
                <span className="font-mono text-accent text-xs font-semibold">
                  {config?.generation_model || "Loading..."}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-content-primary block">Embedding Model</span>
                  <span className="text-[11px] text-content-muted">Vector model generating document chunk embeddings</span>
                </div>
                <span className="font-mono text-content-primary text-xs">
                  {config?.embedding_model || "Loading..."}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-content-primary block">Chunk Size & Overlap</span>
                  <span className="text-[11px] text-content-muted">Token boundary window per stored document chunk</span>
                </div>
                <span className="font-mono text-content-secondary text-xs tabular-nums">
                  {config ? `${config.default_chunk_size} tokens / ${config.default_chunk_overlap} overlap` : "Loading..."}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-content-primary block">Maximum File Upload Limit</span>
                  <span className="text-[11px] text-content-muted">Strict size ceiling evaluated before disk writes</span>
                </div>
                <span className="font-mono text-content-secondary text-xs tabular-nums">
                  {config ? `${config.max_file_size_mb} MB (${config.max_file_size_bytes.toLocaleString()} bytes)` : "Loading..."}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-content-primary block">Permitted File Formats</span>
                  <span className="text-[11px] text-content-muted">Validated by file extension and magic-byte signature</span>
                </div>
                <div className="flex items-center gap-1">
                  {(config?.allowed_extensions || [".pdf", ".txt"]).map((ext) => (
                    <span
                      key={ext}
                      className="px-2 py-0.5 rounded-[4px] bg-surface-subtle border border-border font-mono text-[11px] text-content-primary uppercase"
                    >
                      {ext.replace(".", "")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-content-primary block">Default Retrieval Top-K</span>
                  <span className="text-[11px] text-content-muted">Candidate chunks retrieved for relevance filtering</span>
                </div>
                <span className="font-mono text-content-secondary text-xs tabular-nums">
                  {config?.default_top_k || 5} chunks
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-content-primary block">Relevance Distance Threshold</span>
                  <span className="text-[11px] text-content-muted">Maximum cosine distance threshold for context inclusion</span>
                </div>
                <span className="font-mono text-content-secondary text-xs tabular-nums">
                  {config?.relevance_threshold || 0.65}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Service Health & Diagnostics */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <span>Backend Health & Connectivity</span>
              </h2>
              <p className="text-xs text-content-secondary mt-1">
                Real-time operational status of the SQLite database and ChromaDB vector store.
              </p>
            </div>

            <Button
              variant="secondary"
              size="xs"
              onClick={runHealthProbe}
              disabled={pinging}
              className="inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${pinging ? "animate-spin" : ""}`} />
              <span>Probe Health</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block">
                Overall API Status
              </span>
              <div className="flex items-center gap-2 pt-1">
                <StatusDot
                  status={healthData?.status === "healthy" ? "Ready" : "Failed"}
                  size="md"
                />
                <span className="text-xs font-semibold text-content-primary capitalize">
                  {healthData?.status || "Checking..."}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block">
                Database Engine
              </span>
              <div className="flex items-center gap-2 pt-1">
                <Database className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-content-primary capitalize">
                  {healthData?.database || "SQLite Connected"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block">
                API Round-Trip Latency
              </span>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono text-xs font-bold text-semantic-success-text tabular-nums">
                  {pingLatency !== null ? `${pingLatency} ms` : "Probing..."}
                </span>
                <span className="text-[10px] text-content-muted">via local loopback</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Workspace & Visitor Identity */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>Workspace & Visitor Session Identity</span>
            </h2>
            <p className="text-xs text-content-secondary mt-1">
              Your research desk operates without mandatory logins. Data is bound to your unique cryptographic visitor token.
            </p>
          </div>

          <div className="rounded-[6px] border border-border bg-surface p-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block mb-1">
                  Active Workspace
                </span>
                <span className="font-semibold text-content-primary">
                  {activeWorkspace?.name || "Default Workspace"}
                </span>
                <span className="font-mono text-[10px] text-content-muted block mt-0.5 truncate select-all">
                  ID: {activeWorkspace?.id || "None"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block mb-1">
                  Visitor Session Token
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-content-secondary truncate max-w-[200px] select-all">
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
            </div>

            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-content-secondary">
                To start completely fresh with a new workspace and blank research canvas:
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={handleResetSession}
                className="inline-flex items-center gap-1.5 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Visitor Session</span>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

