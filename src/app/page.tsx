// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// We create a new, dedicated Header just for the landing page.
function LandingPageHeader() {
  const { user, role, isLoading, logout } = useAuth();
  const isAuthenticated = !!user;

  if (isLoading) {
    return <div className="h-16" />; // Placeholder to prevent layout shift
  }

  return (
    <header className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
      <Link href="/" className="font-bold sm:inline-block font-headline text-lg">
        Cove
      </Link>
      <nav>
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard">Go to Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/admin/login">
            <Button>Login</Button>
          </Link>
        )}
      </nav>
    </header>
  );
}

// A simple, dedicated footer for the landing page.
function LandingPageFooter() {
    return (
        <footer className="bg-muted/40 mt-12 border-t">
            <div className="container mx-auto px-6 py-8">
            <p className="text-center text-sm text-foreground/60">
                © {new Date().getFullYear()} Cove. All Rights Reserved.
            </p>
            </div>
        </footer>
    );
}


export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <LandingPageHeader />
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight font-headline lg:text-6xl">
            The Future of E-commerce is Yours to Build
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-foreground/80">
            Cove provides the tools you need to launch and scale a beautiful, modern e-commerce store.
            Focus on your products; we'll handle the rest.
          </p>
          <div className="mt-8">
            {isAuthenticated ? (
                 <Link href="/admin/dashboard">
                    <Button size="lg">Go to Your Dashboard</Button>
                 </Link>
            ) : (
                // This button can later link to a "Contact Us" or "Request Access" form.
                <Button size="lg">Request an Account</Button>
            )}
          </div>
        </section>
      </main>
      <LandingPageFooter />
    </div>
  );
}