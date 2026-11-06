import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { WorkspaceLayout } from "./components/layout/WorkspaceLayout";
import { LandingPage } from "./pages/LandingPage";
import { HomePage } from "./pages/HomePage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ResearchPage } from "./pages/ResearchPage";
import { DocsPage } from "./pages/DocsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { DocumentViewerPage } from "./pages/DocumentViewerPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CommandPalette } from "./components/ui/CommandPalette";

export default function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />

          <Routes>
            {/* Landing & Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/design-system" element={<DesignSystemPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Document Viewer Dedicated Route */}
            <Route path="/documents/:id" element={<DocumentViewerPage />} />
            <Route path="/workspace/documents/:id" element={<DocumentViewerPage />} />

            {/* Application Workspace Routes */}
            <Route path="/workspace" element={<WorkspaceLayout />}>
              <Route index element={<HomePage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="research" element={<ResearchPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}
