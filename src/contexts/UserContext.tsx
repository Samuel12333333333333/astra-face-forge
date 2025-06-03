
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserContext: Setting up auth state listener');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('UserContext: Auth state changed', { 
          event, 
          user: session?.user?.id,
          hasSession: !!session 
        });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('UserContext: Error getting session:', error);
      }
      console.log('UserContext: Initial session check', { 
        user: session?.user?.id,
        hasSession: !!session 
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('UserContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading
  };

  console.log('UserContext: Current state', { 
    hasUser: !!user, 
    userId: user?.id, 
    loading,
    hasSession: !!session
  });

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
