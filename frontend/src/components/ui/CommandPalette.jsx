import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  Sparkles,
  Layers,
  Settings,
  BookOpen,
  Sun,
  Moon,
  Laptop,
  Upload,
  ArrowRight,
  X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { api } from "../../api/client";

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { activeWorkspace } = useWorkspace();

  // Load documents when palette opens
  useEffect(() => {
    if (!isOpen || !activeWorkspace) return;
    let isMounted = true;
    async function load() {
      try {
        setLoadingDocs(true);
        const res = await api.getDocuments(activeWorkspace.id);
        if (isMounted) {
          setDocuments(res.documents || []);
        }
      } catch (err) {
        // Non-blocking for command palette
      } finally {
        if (isMounted) setLoadingDocs(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeWorkspace]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static command items
  const navigationCommands = [
    {
      id: "nav-home",
      group: "Navigation",
      title: "Go to Workspace Home",
      icon: Layers,
      action: () => navigate("/workspace"),
    },
    {
      id: "nav-documents",
      group: "Navigation",
      title: "Go to Document Library",
      icon: FileText,
      action: () => navigate("/workspace/documents"),
    },
    {
      id: "nav-research",
      group: "Navigation",
      title: "Open Research Workspace",
      icon: Sparkles,
      action: () => navigate("/workspace/research"),
    },
    {
      id: "nav-docs",
      group: "Navigation",
      title: "Open System Documentation",
      icon: BookOpen,
      action: () => navigate("/docs"),
    },
    {
      id: "theme-light",
      group: "Theme",
      title: "Switch to Light Theme (Default Paper)",
      icon: Sun,
      action: () => setTheme("light"),
    },
    {
      id: "theme-dark",
      group: "Theme",
      title: "Switch to Dark Theme (Obsidian Slate)",
      icon: Moon,
      action: () => setTheme("dark"),
    },
    {
      id: "theme-system",
      group: "Theme",
      title: "Match System Preference",
      icon: Laptop,
      action: () => setTheme("system"),
    },
  ];

  // Document items
  const docCommands = documents.map((doc) => ({
    id: `doc-${doc.id}`,
    group: "Documents",
    title: doc.filename,
    subtitle: `${doc.chunk_count || 0} chunks, Page ${doc.page_count || 1}`,
    icon: FileText,
    action: () => navigate(`/workspace/documents`),
  }));

  const allCommands = [...docCommands, ...navigationCommands];

  const filteredCommands = query.trim()
    ? allCommands.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          (c.subtitle && c.subtitle.toLowerCase().includes(query.toLowerCase())) ||
          c.group.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredCommands[selectedIndex];
      if (target) {
        target.action();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-[8px] shadow-floating overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border bg-surface">
          <Search className="w-4 h-4 text-content-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search documents by name..."
            className="flex-1 bg-transparent text-xs text-content-primary placeholder:text-content-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded text-content-muted hover:text-content-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-content-muted bg-surface-subtle border border-border rounded-[3px]">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs text-content-muted">
              No matching commands or documents found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2 rounded-[5px] text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-accent-subtle/70 text-content-primary"
                      : "text-content-secondary hover:bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate font-medium">{cmd.title}</span>
                    {cmd.subtitle && (
                      <span className="text-[11px] text-content-muted truncate">
                        ({cmd.subtitle})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-mono text-content-muted shrink-0 pl-2">
                    {cmd.group}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-3 py-1.5 border-t border-border bg-surface-subtle/50 flex items-center justify-between text-[11px] text-content-muted">
          <div className="flex items-center gap-2">
            <span>Navigate:</span>
            <kbd className="px-1 py-0.2 font-mono bg-surface border border-border rounded-[3px]">↑</kbd>
            <kbd className="px-1 py-0.2 font-mono bg-surface border border-border rounded-[3px]">↓</kbd>
            <span>Select:</span>
            <kbd className="px-1 py-0.2 font-mono bg-surface border border-border rounded-[3px]">↵</kbd>
          </div>
          <span>DocuMind Command Palette</span>
        </div>
      </div>
    </div>
  );
}

