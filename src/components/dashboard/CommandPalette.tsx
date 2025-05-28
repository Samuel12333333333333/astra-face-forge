
import React, { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { 
  Camera, 
  Settings, 
  Images, 
  Sparkles, 
  User, 
  CreditCard,
  Bell,
  Download,
  Share2,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (action: string, path?: string) => {
    setOpen(false);
    
    if (path) {
      navigate(path);
    } else if (action === "sign-out") {
      handleSignOut();
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(`Sign out error: ${error.message}`);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect("navigate", "/dashboard/overview")}>
            <Camera className="h-4 w-4 mr-2" />
            <span>Go to Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("navigate", "/dashboard/tunes")}>
            <Camera className="h-4 w-4 mr-2" />
            <span>Go to My Tunes</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("navigate", "/dashboard/gallery")}>
            <Images className="h-4 w-4 mr-2" />
            <span>Go to Gallery</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("navigate", "/dashboard/settings/account")}>
            <Settings className="h-4 w-4 mr-2" />
            <span>Go to Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleSelect("navigate", "/dashboard/tunes")}>
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Generate New Headshots</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("download")}>
            <Download className="h-4 w-4 mr-2" />
            <span>Download Brand Kit</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("share")}>
            <Share2 className="h-4 w-4 mr-2" />
            <span>Share Profile</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => handleSelect("navigate", "/dashboard/settings/account")}>
            <User className="h-4 w-4 mr-2" />
            <span>Profile Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("navigate", "/dashboard/settings/billing")}>
            <CreditCard className="h-4 w-4 mr-2" />
            <span>Billing & Subscription</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("navigate", "/dashboard/settings/notifications")}>
            <Bell className="h-4 w-4 mr-2" />
            <span>Notification Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("sign-out")} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
