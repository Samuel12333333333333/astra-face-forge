
import React from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbNavigation } from "@/components/dashboard/BreadcrumbNavigation";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { CommandPalette } from "@/components/dashboard/CommandPalette";

interface DashboardMainProps {
  children: React.ReactNode;
}

export function DashboardMain({ children }: DashboardMainProps) {
  return (
    <SidebarInset className="flex-1">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNavigation />
        <div className="ml-auto flex items-center gap-2">
          <NotificationCenter />
        </div>
      </header>
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
      
      <CommandPalette />
    </SidebarInset>
  );
}
