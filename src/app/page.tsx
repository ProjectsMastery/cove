"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// The new, redesigned Header for the landing page
function LandingPageHeader() {
  const { user, isLoading, logout } = useAuth();
  const isAuthenticated = !!user;

  // Render a placeholder to prevent layout shift while auth is loading
  if (isLoading) {
    return <header className="h-20" />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-bold font-headline text-2xl tracking-tight text-foreground">
          Cove
        </Link>
        <nav>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/admin/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/admin/login">
              <Button className="cursor-pointer">Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

// The new, redesigned Footer
function LandingPageFooter() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-6 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cove. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// The new, redesigned Landing Page
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
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 sm:py-32 text-center">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#2e2e2e_1px,transparent_1px)] [background-size:16px_16px] animate-move-dots"></div>
          
          <h1 className="text-5xl lg:text-7xl text-white font-headline font-bold tracking-tight leading-tight">
            The Future of E-commerce is Yours to Build
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg leading-relaxed text-muted-foreground">
            Cove provides the tools you need to launch and scale a beautiful, modern e-commerce store.
            Focus on your products; we'll handle the rest.
          </p>
          <div className="mt-10">
            {isAuthenticated ? (
              <Link href="/admin/dashboard">
                <Button size="lg" className="px-8 py-6 text-lg cursor-pointer">
                  Go to Your Dashboard
                </Button>
              </Link>
            ) : (
              // This button can later link to a contact or request access form
              <Button size="lg" className="px-8 py-6 text-lg cursor-pointer">
                Request an Account
              </Button>
            )}
          </div>
        </section>
      </main>
      <LandingPageFooter />
    </div>
  );
}