
import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbNavigation } from "@/components/dashboard/BreadcrumbNavigation";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export function TopNavigation() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
          <UserProfileDropdown user={user} />
        </div>
      </header>
      <CommandPalette />
    </>
  );
}
