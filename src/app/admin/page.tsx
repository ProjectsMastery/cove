// src/app/admin/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

/**
 * This is the root page for the /admin route.
 * Its sole purpose is to redirect the user to the appropriate page.
 */
export default function AdminRootPage() {
  const router = useRouter();
  // --- VVV THIS IS THE FIX VVV ---
  // We get the correct state from our useAuth hook: user, role, and isLoading.
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    // Wait for the authentication check to complete
    if (!isLoading) {
      const isAuthenticated = !!user;
      const userIsAdmin = role === 'admin' || role === 'superadmin';

      if (isAuthenticated && userIsAdmin) {
        // If the user is an admin, the main dashboard is the true root.
        router.replace('/admin/dashboard');
      } else {
        // If they are not an authenticated admin, send them to the login page.
        router.replace('/admin/login');
      }
    }
  }, [isLoading, user, role, router]);

  // Render a full-page loader while the redirect is happening
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}