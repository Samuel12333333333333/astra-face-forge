
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardMain } from "@/components/dashboard/DashboardMain";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import TunesPage from "@/components/dashboard/TunesPage";
import TuneDetailPage from "@/components/dashboard/TuneDetailPage";
import TuneOverviewPage from "@/components/dashboard/tunes/TuneOverviewPage";
import GeneratePage from "@/components/dashboard/GeneratePage";
import GalleryPage from "@/components/dashboard/GalleryPage";
import AccountSettings from "@/components/dashboard/settings/AccountSettings";
import BillingSettings from "@/components/dashboard/settings/BillingSettings";
import NotificationSettings from "@/components/dashboard/settings/NotificationSettings";
import { useUser } from "@/contexts/UserContext";

const ModernDashboard = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <DashboardMain>
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="tunes" element={<TunesPage />} />
            <Route path="tunes/:tuneId" element={<TuneDetailPage />} />
            <Route path="tunes/:tuneId/overview" element={<TuneOverviewPage />} />
            <Route path="tunes/:tuneId/generate" element={<GeneratePage />} />
            <Route path="tunes/:tuneId/gallery" element={<GalleryPage />} />
            <Route path="generate" element={<GeneratePage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="analytics" element={<DashboardOverview />} />
            <Route path="settings/account" element={<AccountSettings />} />
            <Route path="settings/billing" element={<BillingSettings />} />
            <Route path="settings/notifications" element={<NotificationSettings />} />
          </Routes>
        </DashboardMain>
      </div>
    </SidebarProvider>
  );
};

export default ModernDashboard;
