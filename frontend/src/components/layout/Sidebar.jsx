import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Sparkles,
  Layers,
  ChevronDown,
  Plus,
  X,
  Settings,
  Activity,
  BookOpen,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Button } from "../ui/Button";
import { BrandWordmark, BrandMark } from "../ui/BrandMark";

export function Sidebar({
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  onCloseMobile,
}) {
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace } =
    useWorkspace();
  const location = useLocation();

  const [showWsMenu, setShowWsMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [creating, setCreating] = useState(false);

  const isMac =
    typeof navigator !== "undefined" &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

  const navItems = [
    { label: "Overview", path: "/workspace", icon: Layers },
    { label: "Document Library", path: "/workspace/documents", icon: FileText },
    { label: "AI Research", path: "/workspace/research", icon: Sparkles },
    { label: "Settings", path: "/workspace/settings", icon: Settings },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      setCreating(true);
      await createWorkspace(newWsName.trim());
      setNewWsName("");
      setShowCreateModal(false);
      setShowWsMenu(false);
    } catch (err) {
      alert("Failed to create workspace: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40 animate-in fade-in duration-150"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen border-r border-border bg-surface flex flex-col shrink-0 transition-transform md:transition-all duration-200 select-none ${
          mobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "md:w-14" : "md:w-60"}`}
      >
        {/* Brand Header */}
        <div className="h-13 border-b border-border px-3.5 flex items-center justify-between">
          <Link to="/" onClick={handleNavClick} className="flex items-center min-w-0" title="DocuMind AI">
            {collapsed ? (
              <BrandMark size={20} className="text-accent mx-auto" />
            ) : (
              <BrandWordmark size={18} />
            )}
          </Link>

          <div className="flex items-center gap-1">
            {setCollapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:inline-flex p-1 rounded-[4px] hover:bg-surface-subtle text-content-muted hover:text-content-primary transition-colors cursor-pointer"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <BrandMark size={14} className="opacity-40" />
              </button>
            )}

            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1 rounded-[4px] hover:bg-surface-subtle text-content-muted hover:text-content-primary transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Workspace Switcher & New Workspace Action */}
        {!collapsed && (
          <div className="p-2 border-b border-border relative">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowWsMenu(!showWsMenu)}
                className="flex-1 min-w-0 flex items-center justify-between p-1.5 rounded-[5px] hover:bg-surface-subtle border border-border/70 text-left transition-colors cursor-pointer"
                title="Switch workspace"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-xs font-semibold text-content-primary truncate">
                    {activeWorkspace?.name || "Default Workspace"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-content-muted shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="p-1.5 rounded-[5px] hover:bg-surface-subtle border border-border/70 text-content-secondary hover:text-accent transition-colors cursor-pointer"
                title="New workspace"
                aria-label="New workspace"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {showWsMenu && (
              <div className="absolute top-full left-2 right-2 mt-1 z-40 bg-surface border border-border rounded-[6px] shadow-lg p-1 space-y-0.5">
                <div className="text-[10px] uppercase font-semibold text-content-muted px-2 py-1 tracking-wider">
                  Workspaces ({workspaces.length})
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      switchWorkspace(ws);
                      setShowWsMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-[4px] text-xs truncate flex items-center justify-between cursor-pointer ${
                      activeWorkspace?.id === ws.id
                        ? "bg-accent-subtle text-content-primary font-medium"
                        : "hover:bg-surface-subtle text-content-secondary hover:text-content-primary"
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace?.id === ws.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                ))}

                <div className="pt-1 mt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWsMenu(false);
                      setShowCreateModal(true);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-[4px] text-xs text-accent hover:bg-surface-subtle font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`relative flex items-center gap-2.5 py-1.5 rounded-[5px] text-xs transition-colors ${
                  isActive
                    ? "bg-accent-subtle/80 text-content-primary font-semibold pl-3 pr-2"
                    : "text-content-secondary hover:text-content-primary hover:bg-surface-subtle pl-3 pr-2"
                } ${collapsed ? "justify-center !px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-accent" : "text-content-muted"}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer info: Documentation & System Diagnostics links */}
        {!collapsed ? (
          <div className="p-2.5 border-t border-border space-y-0.5">
            <Link
              to="/system"
              onClick={handleNavClick}
              className="w-full flex items-center gap-2 p-1.5 rounded-[5px] text-content-secondary hover:text-content-primary hover:bg-surface-subtle text-xs transition-colors"
              title="System Diagnostics and pipeline telemetry"
            >
              <Activity className="w-3.5 h-3.5 text-content-muted shrink-0" />
              <span className="truncate">System Diagnostics</span>
            </Link>

            <Link
              to="/docs"
              onClick={handleNavClick}
              className="w-full flex items-center gap-2 p-1.5 rounded-[5px] text-content-secondary hover:text-content-primary hover:bg-surface-subtle text-xs transition-colors"
              title="Documentation and technical specifications"
            >
              <BookOpen className="w-3.5 h-3.5 text-content-muted shrink-0" />
              <span className="truncate">Documentation</span>
            </Link>
          </div>
        ) : (
          <div className="p-2 border-t border-border flex flex-col items-center gap-1">
            <Link
              to="/system"
              className="p-1.5 rounded-[4px] text-content-secondary hover:text-content-primary hover:bg-surface-subtle"
              title="System Diagnostics"
              aria-label="System Diagnostics"
            >
              <Activity className="w-4 h-4" />
            </Link>
            <Link
              to="/docs"
              className="p-1.5 rounded-[4px] text-content-secondary hover:text-content-primary hover:bg-surface-subtle"
              title="Documentation"
              aria-label="Documentation"
            >
              <BookOpen className="w-4 h-4" />
            </Link>
          </div>
        )}
      </aside>

      {/* New Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-surface border border-border rounded-[8px] p-5 shadow-floating">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-content-primary">
                Create Workspace
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-[4px] text-content-muted hover:text-content-primary"
                aria-label="Close modal"
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
                  placeholder="e.g. Technical Architecture Review"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-canvas border border-border rounded-[5px] text-content-primary focus:outline-none focus:border-accent"
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
