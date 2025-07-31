"use client";

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: Profile['role'] | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // We remove the regular 'register' function, as it's no longer used.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
          if (error) throw error;
          setProfile(data as Profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // The new, simplified "Traffic Cop"
  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = !!user;
    const userRole = profile?.role;
    const isAdminRoute = pathname.startsWith('/admin');
    const isAuthRoute = pathname === '/admin/login' || pathname === '/admin-signup';

    // Case 1: User is logged in but on the login page. Redirect to dashboard.
    if (isAuthenticated && isAuthRoute) {
      router.push('/admin/dashboard');
    }

    // Case 2: User is logged out but trying to access a protected admin page.
    if (!isAuthenticated && isAdminRoute && !isAuthRoute) {
      router.push('/admin/login');
    }

  }, [isLoading, user, profile, pathname, router]);
  
  const login = useCallback(async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, [supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/'); // On logout, send them to the main Cove landing page.
  }, [supabase, router]);
  
  return (
    <AuthContext.Provider value={{ user, profile, role: profile?.role || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};