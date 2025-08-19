
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import DashboardPage from "./DashboardPage";

export default function App() {
  return (
    <div className="dashboard">
      <Routes>
        {/* Loads first when the site opens */}
        <Route path="/" element={<LandingPage />} />
        {/* After the (decoy) login, we go here */}
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
