
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Camera, Sparkles, CreditCard } from "lucide-react";

export function NotificationCenter() {
  const notifications = [
    {
      id: 1,
      title: "New headshots ready!",
      description: "Your Business Pro headshots are ready to download",
      time: "2 minutes ago",
      icon: Camera,
      unread: true,
    },
    {
      id: 2,
      title: "Model training complete",
      description: "Your AI model has finished training",
      time: "1 hour ago",
      icon: Sparkles,
      unread: true,
    },
    {
      id: 3,
      title: "Payment processed",
      description: "Your Pro subscription has been renewed",
      time: "2 days ago",
      icon: CreditCard,
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <DropdownMenuItem key={notification.id} className="flex items-start gap-3 p-3">
              <div className={`p-2 rounded-full ${notification.unread ? 'bg-brand-100' : 'bg-gray-100'}`}>
                <Icon className={`h-4 w-4 ${notification.unread ? 'text-brand-600' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{notification.title}</p>
                  {notification.unread && (
                    <div className="h-2 w-2 bg-brand-600 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center justify-center">
          <span>View all notifications</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
