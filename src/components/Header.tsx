
import React from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  return (
    <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-brand-600" />
          <span className="font-bold text-xl text-foreground">AI Headshots</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">How It Works</Button>
          <Button variant="ghost" size="sm">Examples</Button>
          <Button size="sm">Sign In</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
