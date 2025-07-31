// src/app/admin/layout.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Store, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// This layout will wrap all pages inside the `/admin` directory.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading, logout } = useAuth();
  const pathname = usePathname();

  // The guard clause. While auth is loading, we show a full-page loader.
  // The "Traffic Cop" in useAuth is already handling redirects for unauthorized users.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is not an admin/superadmin, the traffic cop will redirect them,
  // but we render null here as a fallback to prevent content flashing.
  if (role !== 'admin' && role !== 'superadmin') {
      return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* --- ADMIN SIDEBAR --- */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link href="/admin/dashboard" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
              {/* You can put a logo here */}
              C
              <span className="sr-only">Cove Admin</span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/dashboard" className={`flex h-9 w-9 items-center justify-center rounded-lg ${pathname === '/admin/dashboard' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground md:h-8 md:w-8`}>
                  <Store className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            {/* Super admin link to create new admins */}
            {role === 'superadmin' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/admin-signup" className={`flex h-9 w-9 items-center justify-center rounded-lg ${pathname === '/admin-signup' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground md:h-8 md:w-8`}>
                    <Users className="h-5 w-5" />
                    <span className="sr-only">Manage Admins</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Manage Admins</TooltipContent>
              </Tooltip>
            )}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => logout()} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* We can add a simple header for mobile here if needed */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}