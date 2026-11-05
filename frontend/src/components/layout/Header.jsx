import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Layers, ChevronRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useWorkspace } from "../../context/WorkspaceContext";

export function Header({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const { activeWorkspace } = useWorkspace();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/workspace/documents") return "Documents";
    if (path === "/workspace/research") return "AI Research";
    if (path === "/docs") return "System Documentation";
    return "Overview";
  };

  return (
    <header className="h-14 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-content-secondary">
          <Link
            to="/workspace"
            className="hover:text-content-primary transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>{activeWorkspace?.name || "Workspace"}</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-content-muted" />
          <span className="text-content-primary font-semibold">{getBreadcrumbs()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <Link
          to="/"
          className="text-xs font-medium text-content-secondary hover:text-content-primary px-2.5 py-1 rounded hover:bg-surface-subtle transition-colors"
        >
          Landing Page
        </Link>
      </div>
    </header>
  );
}
