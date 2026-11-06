import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Sparkles,
  Layers,
  ChevronDown,
  Plus,
  X,
  Menu,
  Command,
  Settings,
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

  const navItems = [
    { label: "Home", path: "/workspace", icon: Layers },
    { label: "Document Library", path: "/workspace/documents", icon: FileText },
    { label: "Research Canvas", path: "/workspace/research", icon: Sparkles },
    { label: "Settings & Config", path: "/settings", icon: Settings },
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

  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
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

        {/* Workspace Switcher */}
        {!collapsed && (
          <div className="p-2.5 border-b border-border relative">
            <button
              type="button"
              onClick={() => setShowWsMenu(!showWsMenu)}
              className="w-full flex items-center justify-between p-1.5 rounded-[5px] hover:bg-surface-subtle border border-border/70 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="text-xs font-semibold text-content-primary truncate">
                  {activeWorkspace?.name || "Default Workspace"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-content-muted shrink-0" />
            </button>

            {showWsMenu && (
              <div className="absolute top-full left-2.5 right-2.5 mt-1 z-40 bg-surface border border-border rounded-[6px] shadow-lg p-1 space-y-0.5">
                <div className="text-[10px] uppercase font-semibold text-content-muted px-2 py-1 tracking-wider">
                  Workspaces
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
                className={`flex items-center gap-2.5 py-1.5 rounded-[5px] text-xs transition-colors ${
                  isActive
                    ? "bg-accent-subtle/80 text-content-primary font-semibold border-l-2 border-accent pl-2.5 pr-2"
                    : "text-content-secondary hover:text-content-primary hover:bg-surface-subtle pl-3 pr-2"
                } ${collapsed ? "justify-center !px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-accent" : "text-content-muted"}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer shortcuts info */}
        {!collapsed ? (
          <div className="p-2.5 border-t border-border">
            <button
              type="button"
              onClick={triggerCommandPalette}
              className="w-full flex items-center justify-between p-1.5 rounded-[5px] text-content-muted hover:text-content-primary hover:bg-surface-subtle text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5 text-accent" />
                <span>Command Menu</span>
              </div>
              <kbd className="text-[10px] font-mono px-1 py-0.2 bg-surface-subtle border border-border rounded-[3px]">
                ⌘K
              </kbd>
            </button>
          </div>
        ) : (
          <div className="p-2 border-t border-border text-center">
            <button
              type="button"
              onClick={triggerCommandPalette}
              className="p-1.5 rounded-[4px] text-content-muted hover:text-content-primary hover:bg-surface-subtle"
              title="Command Menu (⌘K)"
            >
              <Command className="w-4 h-4" />
            </button>
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
