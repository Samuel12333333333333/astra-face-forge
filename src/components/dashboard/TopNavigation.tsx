
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbNavigation } from "@/components/dashboard/BreadcrumbNavigation";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown";
import { CommandPalette } from "@/components/dashboard/CommandPalette";

export function TopNavigation() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1 h-8 w-8" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1 min-w-0">
          <BreadcrumbNavigation />
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <UserProfileDropdown />
        </div>
      </header>
      <CommandPalette />
    </>
  );
}
