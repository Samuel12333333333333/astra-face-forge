
import React, { useState, useEffect } from "react";
import { Camera, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(`Authentication error: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(`Sign out error: ${error.message}`);
    }
  };

  return (
    <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Camera className="h-6 w-6 text-brand-600" />
          <span className="font-bold text-xl text-foreground">AI Headshots</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="#how-it-works">
            <Button variant="ghost" size="sm">How It Works</Button>
          </Link>
          <Link to="#examples">
            <Button variant="ghost" size="sm">Examples</Button>
          </Link>
          
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback>
                      {user.email ? user.email.substring(0, 2).toUpperCase() : "UN"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline max-w-[150px] truncate">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={handleSignIn}>
              <User className="mr-2 h-4 w-4" /> Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
