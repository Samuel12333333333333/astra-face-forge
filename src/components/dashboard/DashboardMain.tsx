
import React from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { TopNavigation } from "@/components/dashboard/TopNavigation";

interface DashboardMainProps {
  children: React.ReactNode;
}

export function DashboardMain({ children }: DashboardMainProps) {
  return (
    <SidebarInset className="flex-1">
      <TopNavigation />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </SidebarInset>
  );
}
