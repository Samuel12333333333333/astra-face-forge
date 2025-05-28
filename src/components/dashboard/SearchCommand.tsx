
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, Camera, Settings, Images, Sparkles, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-sm text-muted-foreground h-8 px-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search dashboard..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleSelect("/dashboard/overview")}>
              <Camera className="h-4 w-4 mr-2" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/dashboard/tunes")}>
              <Camera className="h-4 w-4 mr-2" />
              <span>My Tunes</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/dashboard/gallery")}>
              <Images className="h-4 w-4 mr-2" />
              <span>Gallery</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => handleSelect("/dashboard/tunes")}>
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Generate Headshots</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/dashboard/settings/account")}>
              <User className="h-4 w-4 mr-2" />
              <span>Account Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/dashboard/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
