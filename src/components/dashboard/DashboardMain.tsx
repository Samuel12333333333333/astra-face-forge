
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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1 h-8 w-8" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1 min-w-0">
          <BreadcrumbNavigation />
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
        </div>
      </header>
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 space-y-4">
          {children}
        </div>
      </main>
      
      <CommandPalette />
    </SidebarInset>
  );
}
