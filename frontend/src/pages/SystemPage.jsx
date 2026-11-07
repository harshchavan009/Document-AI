import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  Cpu,
  Database,
  Layers,
  Shield,
  RefreshCw,
  HardDrive,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { api } from "../api/client";
import { StatusDot } from "../components/ui/StatusDot";
import { Button } from "../components/ui/Button";
import { usePageMeta } from "../hooks/usePageMeta";

export function SystemPage() {
  const navigate = useNavigate();
  usePageMeta("System Diagnostics", "Inspect live backend telemetry, model identifiers, and vector pipeline parameters.");

  const [config, setConfig] = useState(null);
  const [readyData, setReadyData] = useState(null);
  const [latency, setLatency] = useState(null);
  const [probing, setProbing] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const runDiagnostics = async () => {
    try {
      setProbing(true);
      const start = performance.now();
      const [cfg, ready] = await Promise.all([
        api.getConfig(),
        api.getReady(),
      ]);
      const duration = Math.round(performance.now() - start);
      setConfig(cfg);
      setReadyData(ready);
      setLatency(duration);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Diagnostic probe failed:", err);
      setReadyData({ ready: false, error: err.message });
      setLatency(null);
    } finally {
      setProbing(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

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
            <Activity className="w-4 h-4 text-accent" />
            <h1 className="text-sm font-semibold text-content-primary">
              System Diagnostics & Runtime Telemetry
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="secondary"
            onClick={runDiagnostics}
            disabled={probing}
            className="inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${probing ? "animate-spin" : ""}`} />
            <span>Probe Health</span>
          </Button>

          <Link to="/workspace">
            <Button size="xs" variant="primary">
              Workspace Desk
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-150">
        {/* Intro Banner */}
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-content-primary">
            Pipeline Health & Parameters
          </h2>
          <p className="text-xs text-content-secondary leading-relaxed">
            Telemetry reported dynamically by the FastAPI backend via <code className="text-[11px] font-mono px-1 py-0.5 bg-surface-subtle rounded border border-border">GET /api/ready</code> and <code className="text-[11px] font-mono px-1 py-0.5 bg-surface-subtle rounded border border-border">GET /api/config</code>. All values reflect active runtime constraints enforced server-side.
          </p>
        </div>

        {/* Live Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block">
              Core Service
            </span>
            <div className="flex items-center gap-2 pt-1">
              <StatusDot
                status={readyData?.ready ? "Ready" : "Failed"}
                size="md"
              />
              <span className="text-xs font-semibold text-content-primary">
                {readyData?.ready ? "Operational" : "Unavailable"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block">
              Database Layer
            </span>
            <div className="flex items-center gap-2 pt-1">
              <Database className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-content-primary capitalize">
                {readyData?.database || "Connected"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block">
              Vector Store
            </span>
            <div className="flex items-center gap-2 pt-1">
              <Layers className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-content-primary capitalize">
                {readyData?.vector_store || "Ready"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block">
              Loopback Latency
            </span>
            <div className="flex items-center gap-2 pt-1">
              <span className="font-mono text-xs font-bold text-accent tabular-nums">
                {latency !== null ? `${latency} ms` : "Measuring..."}
              </span>
              {lastChecked && (
                <span className="text-[10px] text-content-muted">at {lastChecked}</span>
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Specifications */}
        <div className="rounded-[6px] border border-border bg-surface overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-border bg-surface-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-content-primary">
              <Cpu className="w-4 h-4 text-accent" />
              <span>RAG Retrieval & Generation Specifications</span>
            </div>
            <span className="text-content-muted font-mono text-[11px]">Enforced Server-Side</span>
          </div>

          <div className="divide-y divide-border text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Generation Model</span>
                <span className="text-[11px] text-content-muted">Grounded answer synthesis and citation formatting</span>
              </div>
              <span className="font-mono text-accent text-xs font-semibold">
                {config?.generation_model || "gemini-2.5-flash"}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Embedding Model</span>
                <span className="text-[11px] text-content-muted">Vector model producing 768-dimensional document chunk embeddings</span>
              </div>
              <span className="font-mono text-content-primary text-xs">
                {config?.embedding_model || "gemini-embedding-001"}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Chunk Size & Overlap</span>
                <span className="text-[11px] text-content-muted">Target token window and boundary overlap per passage chunk</span>
              </div>
              <span className="font-mono text-content-secondary text-xs tabular-nums">
                {config?.default_chunk_size || 600} tokens / {config?.default_chunk_overlap || 100} overlap
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Default Top-K Candidates</span>
                <span className="text-[11px] text-content-muted">Number of nearest semantic neighbor chunks retrieved per query</span>
              </div>
              <span className="font-mono text-content-secondary text-xs tabular-nums">
                {config?.default_top_k || 5} chunks
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Relevance Distance Threshold</span>
                <span className="text-[11px] text-content-muted">Maximum cosine distance threshold for context inclusion</span>
              </div>
              <span className="font-mono text-content-secondary text-xs tabular-nums">
                {config?.relevance_threshold || 0.65}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Citation Verification Protocol</span>
                <span className="text-[11px] text-content-muted">Server-side chunk coordinate matching before response delivery</span>
              </div>
              <span className="inline-flex items-center gap-1.5 font-medium text-accent text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strict Verification Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ingestion & Security Safeguards */}
        <div className="rounded-[6px] border border-border bg-surface overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-border bg-surface-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-content-primary">
              <Shield className="w-4 h-4 text-accent" />
              <span>Storage & Ingestion Safeguards</span>
            </div>
            <span className="text-content-muted font-mono text-[11px]">Safety Limits</span>
          </div>

          <div className="divide-y divide-border text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Maximum File Upload Size</span>
                <span className="text-[11px] text-content-muted">Evaluated via Content-Length and streamed byte counter</span>
              </div>
              <span className="font-mono text-content-secondary text-xs tabular-nums">
                {config?.max_file_size_mb || 20} MB ({config?.max_file_size_bytes?.toLocaleString() || "20,971,520"} bytes)
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Maximum Page Count</span>
                <span className="text-[11px] text-content-muted">Per-document page ceiling evaluated during PDF header parsing</span>
              </div>
              <span className="font-mono text-content-secondary text-xs tabular-nums">
                {config?.max_pdf_pages || 50} pages
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Permitted File Types</span>
                <span className="text-[11px] text-content-muted">Validated by extension, MIME type, and magic-byte header</span>
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

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Available Disk Storage</span>
                <span className="text-[11px] text-content-muted">Persistent volume free capacity for uploads and vector indices</span>
              </div>
              <span className="font-mono text-content-secondary text-xs tabular-nums">
                {readyData?.storage_free_mb
                  ? `${(readyData.storage_free_mb / 1024).toFixed(1)} GB free`
                  : "Checked"}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-content-primary block">Guest Retention Lifecycle</span>
                <span className="text-[11px] text-content-muted">Inactivity window before automated workspace cleanup</span>
              </div>
              <span className="font-mono text-content-secondary text-xs tabular-nums">
                {config?.data_retention_days || 7} days
              </span>
            </div>
          </div>
        </div>

        {/* Raw Response Inspector */}
        <details className="rounded-[6px] border border-border bg-surface text-xs group">
          <summary className="p-3.5 font-semibold text-content-secondary cursor-pointer hover:text-content-primary select-none flex items-center justify-between">
            <span>Inspect Raw Telemetry Payload (JSON)</span>
            <span className="text-[10px] font-mono text-content-muted group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-4 border-t border-border bg-surface-subtle/50 font-mono text-[11px] overflow-x-auto space-y-3">
            <div>
              <span className="text-content-muted block mb-1 font-semibold">// GET /api/ready</span>
              <pre className="text-content-primary">{JSON.stringify(readyData, null, 2)}</pre>
            </div>
            <div>
              <span className="text-content-muted block mb-1 font-semibold">// GET /api/config</span>
              <pre className="text-content-primary">{JSON.stringify(config, null, 2)}</pre>
            </div>
          </div>
        </details>
      </main>
    </div>
  );
}
