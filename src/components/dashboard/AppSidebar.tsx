
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown";
import { WorkspaceDropdown } from "@/components/dashboard/WorkspaceDropdown";
import { SearchCommand } from "@/components/dashboard/SearchCommand";
import { 
  Home, 
  Camera, 
  Sparkles, 
  Images, 
  Settings,
  User,
  CreditCard,
  Bell,
  BarChart3,
  Zap,
  Crown,
  ChevronRight
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNavigation = [
  {
    title: "Dashboard",
    url: "/dashboard/overview",
    icon: Home,
  },
  {
    title: "My Tunes",
    url: "/dashboard/tunes",
    icon: Camera,
    badge: "3",
  },
  {
    title: "Generate",
    url: "/dashboard/tunes",
    icon: Sparkles,
    isNew: true,
  },
  {
    title: "Gallery",
    url: "/dashboard/gallery",
    icon: Images,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
];

const settingsNavigation = [
  {
    title: "Settings",
    icon: Settings,
    items: [
      {
        title: "Account",
        url: "/dashboard/settings/account",
        icon: User,
      },
      {
        title: "Billing",
        url: "/dashboard/settings/billing",
        icon: CreditCard,
      },
      {
        title: "Notifications",
        url: "/dashboard/settings/notifications",
        icon: Bell,
      },
    ],
  },
];

const quickActions = [
  {
    title: "AI Boost",
    url: "/dashboard/boost",
    icon: Zap,
    premium: true,
  },
  {
    title: "Pro Features",
    url: "/dashboard/pro",
    icon: Crown,
    premium: true,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="border-b px-4 py-3 h-16 flex flex-col justify-center">
        <WorkspaceDropdown />
        <div className="mt-2">
          <SearchCommand />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url !== "/dashboard/overview" && location.pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.isNew && (
                          <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.premium && (
                        <Crown className="h-3 w-3 text-amber-500" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavigation.map((item) => (
                <Collapsible key={item.title} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isActive = location.pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <Link to={subItem.url} className="flex items-center gap-3 pl-6 py-2">
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <UserProfileDropdown />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
