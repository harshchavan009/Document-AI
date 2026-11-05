import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { api } from "../../api/client";

export function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [degradedStatus, setDegradedStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await api.getHealth();
        if (isMounted && res.status !== "ok") {
          setDegradedStatus(
            res.detail || "System is operating with degraded performance."
          );
        }
      } catch (err) {
        if (isMounted) {
          setDegradedStatus(
            "Backend service is currently unreachable. Changes may not persist."
          );
        }
      }
    }
    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Only shown if service is actually degraded */}
        {degradedStatus && (
          <div className="p-2 bg-semantic-warning-bg border-b border-semantic-warning-border text-semantic-warning-text text-xs flex items-center justify-center gap-2 font-medium shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{degradedStatus}</span>
          </div>
        )}

        <Header onToggleSidebar={() => setCollapsed(!collapsed)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
