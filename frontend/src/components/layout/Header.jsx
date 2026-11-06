import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Layers, ChevronRight, Search, ExternalLink, Menu } from "lucide-react";
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

      {/* Right Tools: Command Palette Trigger + Theme Toggle + Public Link */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={triggerCommandPalette}
          className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs text-content-secondary bg-surface-subtle hover:bg-surface-hover hover:text-content-primary border border-border rounded-[5px] transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="text-[10px] font-mono px-1 py-0.2 bg-surface text-content-secondary border border-border rounded-[3px]">
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
