import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { WorkspaceLayout } from "./components/layout/WorkspaceLayout";
import { LandingPage } from "./pages/LandingPage";
import { OverviewPage } from "./pages/OverviewPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ResearchPage } from "./pages/ResearchPage";
import { DocsPage } from "./pages/DocsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing & Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Application Workspace Routes */}
            <Route path="/workspace" element={<WorkspaceLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="research" element={<ResearchPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}
