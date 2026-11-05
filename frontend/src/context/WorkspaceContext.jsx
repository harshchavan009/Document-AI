import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      const cfg = await api.getConfig();
      setConfig(cfg);
    } catch (err) {
      console.error("Failed to load runtime configuration:", err);
    }
  }, []);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWorkspaces();
      const list = res.workspaces || [];
      setWorkspaces(list);

      const savedWsId = localStorage.getItem("dm_active_workspace");
      const found = list.find((w) => w.id === savedWsId);
      if (found) {
        setActiveWorkspace(found);
      } else if (list.length > 0) {
        setActiveWorkspace(list[0]);
        localStorage.setItem("dm_active_workspace", list[0].id);
      } else {
        setActiveWorkspace(null);
      }
    } catch (err) {
      setError(err.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchWorkspaces();
  }, [fetchConfig, fetchWorkspaces]);

  const switchWorkspace = (ws) => {
    setActiveWorkspace(ws);
    localStorage.setItem("dm_active_workspace", ws.id);
  };

  const createNewWorkspace = async (name, description = "") => {
    const newWs = await api.createWorkspace(name, description);
    await fetchWorkspaces();
    setActiveWorkspace(newWs);
    localStorage.setItem("dm_active_workspace", newWs.id);
    return newWs;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        switchWorkspace,
        createNewWorkspace,
        refreshWorkspaces: fetchWorkspaces,
        config,
        loading,
        error,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

