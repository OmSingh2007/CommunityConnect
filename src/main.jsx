import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./components/DashboardPage";
import UploadSurveyPage from "./components/UploadSurveyPage";
import SettingsPage from "./components/SettingsPage";
import "./index.css"; // your Tailwind base styles

import DashboardLayout from "./components/DashboardLayout";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* All routes share the persistent layout */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadSurveyPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Catch-all: redirect unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);