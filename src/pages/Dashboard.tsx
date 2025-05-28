
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import TunesPage from "@/components/dashboard/TunesPage";
import TuneDetailPage from "@/components/dashboard/TuneDetailPage";
import GeneratePage from "@/components/dashboard/GeneratePage";
import GalleryPage from "@/components/dashboard/GalleryPage";
import AccountSettings from "@/components/dashboard/settings/AccountSettings";
import BillingSettings from "@/components/dashboard/settings/BillingSettings";
import NotificationSettings from "@/components/dashboard/settings/NotificationSettings";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="/overview" element={<DashboardOverview />} />
        <Route path="/tunes" element={<TunesPage />} />
        <Route path="/tunes/:tuneId" element={<TuneDetailPage />} />
        <Route path="/tunes/:tuneId/generate" element={<GeneratePage />} />
        <Route path="/tunes/:tuneId/gallery" element={<GalleryPage />} />
        <Route path="/settings/account" element={<AccountSettings />} />
        <Route path="/settings/billing" element={<BillingSettings />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
