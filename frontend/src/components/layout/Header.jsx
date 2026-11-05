import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Layers, ChevronRight, Search, ExternalLink } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useWorkspace } from "../../context/WorkspaceContext";

export function Header({ onToggleSidebar }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { activeWorkspace } = useWorkspace();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/workspace/documents") return "Document Library";
    if (path === "/workspace/research") return "Research Canvas";
    if (path === "/docs") return "System Documentation";
    return "Workspace Home";
  };

  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <header className="h-13 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-content-secondary">
          <Link
            to="/workspace"
            className="hover:text-content-primary transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span className="font-semibold text-content-primary">{activeWorkspace?.name || "Default Workspace"}</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-content-muted" />
          <span className="text-content-secondary">{getBreadcrumbs()}</span>
        </div>
      </div>

      {/* Right Tools: Command Palette Trigger + Theme Toggle + Public Link */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={triggerCommandPalette}
          className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs text-content-muted bg-surface-subtle hover:bg-surface-hover hover:text-content-primary border border-border rounded-[5px] transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="text-[10px] font-mono px-1 py-0.2 bg-surface border border-border rounded-[3px]">
            ⌘K
          </kbd>
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
          title="Return to Product Home"
          aria-label="Product Home"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
