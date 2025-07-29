// src/hooks/use-auth.tsx
"use client";

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Define the shape of our Auth context
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{success: boolean; error?: string;}>;
  register: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

          if (error) throw error;
          setIsAdmin(data?.role === 'admin');
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = !!user;
    const isAuthRoute = ['/login', '/register', '/admin/login', '/forgot-password'].includes(pathname);
    const isProtectedRoute = ['/account', 'checkout'].some(route => pathname.startsWith(route));
    const isAdminRoute = pathname.startsWith('/admin');

    if (isAuthenticated && isAuthRoute) {
      router.push(isAdmin ? '/admin/dashboard' : '/account');
    }
    if (!isAuthenticated && (isProtectedRoute || isAdminRoute)) {
      router.push(isAdminRoute ? '/admin/login' : `/login?redirect=${pathname}`);
    }
    if (isAuthenticated && !isAdmin && isAdminRoute) {
        router.push('/');
    }
  }, [isLoading, user, isAdmin, pathname, router]);

  const login = useCallback(async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, [supabase]);

  const register = useCallback(async (email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: {
            emailRedirectTo: `${window.location.origin}/`
        }
    });
    if (error) {
      return { success: false, error: error.message };
    }
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
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
  }, [supabase]);

  return (
    // VVV THIS IS THE FIX VVV
    // We remove `isAuthenticated` from the value, as it's not defined in the AuthContextType.
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout, sendPasswordReset, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};