import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Layers, ChevronRight, Search, ExternalLink, Menu, MessageSquare } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { FeedbackModal } from "../ui/FeedbackModal";

export function Header({ onToggleSidebar }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { activeWorkspace } = useWorkspace();
  const location = useLocation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const isMac = typeof navigator !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/workspace/documents") return "Document Library";
    if (path === "/workspace/research") return "AI Research";
    if (path === "/workspace/settings") return "Settings";
    if (path === "/system") return "System Diagnostics";
    if (path === "/docs") return "System Documentation";
    return "Workspace Home";
  };

  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: isMac,
        ctrlKey: !isMac,
        bubbles: true,
      })
    );
  };

  return (
    <header className="h-13 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Breadcrumbs & Mobile Menu Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 -ml-1 rounded text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-content-secondary min-w-0">
          <Link
            to="/workspace"
            className="hover:text-content-primary transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span className="font-semibold text-content-primary truncate max-w-[120px] sm:max-w-none">
              {activeWorkspace?.name || "Default Workspace"}
            </span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-content-muted shrink-0" />
          <span className="text-content-secondary truncate">{getBreadcrumbs()}</span>
        </div>
      </div>

      {/* Right Tools: Command Palette Trigger + Feedback + Theme Toggle + Public Link */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={triggerCommandPalette}
          className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs text-content-secondary bg-surface-subtle hover:bg-surface-hover hover:text-content-primary border border-border rounded-[5px] transition-colors cursor-pointer"
          title={`Quick search (${isMac ? "⌘K" : "Ctrl+K"})`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="text-[10px] font-mono px-1 py-0.2 bg-surface text-content-secondary border border-border rounded-[3px]">
            {isMac ? "⌘K" : "Ctrl+K"}
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="p-1.5 rounded-[5px] hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
          title="Share feedback or report an issue"
          aria-label="Share feedback"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-[5px] hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
          title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} theme`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <Link
          to="/"
          className="p-1.5 rounded-[5px] hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors inline-flex items-center"
          title="Return to DocuMind AI homepage"
          aria-label="DocuMind AI Homepage"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </header>
  );
}
