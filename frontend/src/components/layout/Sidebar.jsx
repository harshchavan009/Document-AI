import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  BookOpen,
  Plus,
  ChevronDown,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Button } from "../ui/Button";

export function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { workspaces, activeWorkspace, switchWorkspace, createNewWorkspace } = useWorkspace();
  const [showWsMenu, setShowWsMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [creating, setCreating] = useState(false);

  const navItems = [
    { label: "Overview", path: "/workspace", icon: LayoutDashboard },
    { label: "Documents", path: "/workspace/documents", icon: FileText },
    { label: "AI Research", path: "/workspace/research", icon: Sparkles },
    { label: "Documentation", path: "/docs", icon: BookOpen },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      setCreating(true);
      await createNewWorkspace(newWsName.trim());
      setNewWsName("");
      setShowCreateModal(false);
      setShowWsMenu(false);
    } catch (err) {
      alert("Failed to create workspace: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <aside
        className={`h-screen border-r border-border bg-surface flex flex-col shrink-0 transition-all duration-200 z-30 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-border px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-accent flex items-center justify-center text-white font-bold text-xs shrink-0">
              D
            </div>
            {!collapsed && (
              <span className="font-semibold text-sm text-content-primary tracking-tight truncate">
                DocuMind AI
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-surface-subtle text-content-muted hover:text-content-primary transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Switcher */}
        {!collapsed && (
          <div className="p-3 border-b border-border relative">
            <button
              type="button"
              onClick={() => setShowWsMenu(!showWsMenu)}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-surface-subtle border border-border/60 text-left transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-4 h-4 text-accent shrink-0" />
                <span className="text-xs font-semibold text-content-primary truncate">
                  {activeWorkspace?.name || "Select Workspace"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-content-muted shrink-0" />
            </button>

            {showWsMenu && (
              <div className="absolute top-full left-3 right-3 mt-1 z-40 bg-surface border border-border rounded-md shadow-lg p-1.5 space-y-1">
                <div className="text-[10px] uppercase font-semibold text-content-muted px-2 py-1">
                  Your Workspaces
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      switchWorkspace(ws);
                      setShowWsMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs truncate flex items-center justify-between ${
                      activeWorkspace?.id === ws.id
                        ? "bg-accent-subtle text-accent-text font-semibold"
                        : "hover:bg-surface-subtle text-content-secondary"
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[10px] text-content-muted font-mono ml-2">
                      {ws.document_count || 0} docs
                    </span>
                  </button>
                ))}

                <div className="border-t border-border/50 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWsMenu(false);
                      setShowCreateModal(true);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-xs text-accent hover:bg-accent-subtle flex items-center gap-1.5 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create new workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-white shadow-xs"
                    : "text-content-secondary hover:text-content-primary hover:bg-surface-subtle"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        {!collapsed && (
          <div className="p-3 border-t border-border text-[11px] text-content-muted font-mono flex items-center justify-between">
            <span>DocuMind v1.0</span>
            <span className="flex items-center gap-1 text-semantic-success-text">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success-text" />
              Online
            </span>
          </div>
        )}
      </aside>

      {/* New Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-surface border border-border rounded-lg p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-content-primary">
                Create Workspace
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded text-content-muted hover:text-content-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical Research Papers"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-canvas border border-border rounded-md text-content-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit" loading={creating}>
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

