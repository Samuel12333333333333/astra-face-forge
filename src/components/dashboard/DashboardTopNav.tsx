
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { UserProfileDropdown } from "./UserProfileDropdown";

interface DashboardTopNavProps {
  user: User | null;
  onMenuClick: () => void;
}

const DashboardTopNav: React.FC<DashboardTopNavProps> = ({ user, onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden mr-2"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <UserProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
};

export default DashboardTopNav;
