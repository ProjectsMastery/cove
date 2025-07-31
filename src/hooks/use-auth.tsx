// src/hooks/use-auth.tsx
"use client";

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

// VVV We are adding the functions back to the context type VVV
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: Profile['role'] | null;
  storeId: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
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

  // The "Traffic Cop" useEffect remains the same - it's correct.
  useEffect(() => {
    if (isLoading) return;
    const userRole = profile?.role;
    const isAuthRoute = ['/login', '/register', '/admin/login'].includes(pathname);
    const isAdminRoute = pathname.startsWith('/admin');

    if (user && isAuthRoute) {
      router.push(userRole === 'admin' || userRole === 'superadmin' ? '/admin/dashboard' : '/account');
    }
    if (!user && isAdminRoute) {
      router.push('/admin/login');
    }
    if (user && userRole === 'user' && isAdminRoute) {
      router.push('/');
    }
  }, [isLoading, user, profile, pathname, router]);
  
  // --- VVV WE ARE ADDING THE FUNCTIONS BACK IN VVV ---
  const login = useCallback(async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, [supabase]);

  const register = useCallback(async (email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, [supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/');
  }, [supabase, router]);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, [supabase]);
  // --- END OF ADDING FUNCTIONS ---

  return (
    // And finally, we provide them in the context value.
    <AuthContext.Provider value={{ user, profile, role: profile?.role || null, storeId: profile?.store_id || null, isLoading, login, register, logout, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};