
import React, { useState, useEffect } from "react";
import { Camera, User, LogOut, Info, Image } from "lucide-react";
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
        console.log("Auth state changed:", _event, session?.user);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session?.user);
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
      // Clear any previous redirect URL hash that might be stuck
      if (window.location.hash && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      toast.info("Redirecting to Google for authentication...");
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
      
      // Clear any local storage related to user's session
      localStorage.removeItem('currentTuneId');
      localStorage.removeItem('selectedStyle');
      localStorage.removeItem('currentStep');
      
      // Force reload to ensure clean state
      window.location.href = '/';
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
          <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
            <Button variant="ghost" size="sm">
              <Info className="mr-2 h-4 w-4" />
              How It Works
            </Button>
          </a>
          <a href="#examples" className="hover:text-brand-600 transition-colors">
            <Button variant="ghost" size="sm">
              <Image className="mr-2 h-4 w-4" />
              Examples
            </Button>
          </a>
          
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8 border-2 border-brand-100">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback className="bg-brand-100 text-brand-600">
                      {user.email ? user.email.substring(0, 2).toUpperCase() : "UN"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline max-w-[150px] truncate text-sm font-medium">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={handleSignIn} className="bg-brand-600 hover:bg-brand-700">
              <User className="mr-2 h-4 w-4" /> Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
