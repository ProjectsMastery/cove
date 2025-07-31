// src/components/header.tsx
"use client";

import Link from 'next/link';
import { ShoppingBag, User, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from './ui/separator';

export function Header() {
  // We get the auth state from our global hook.
  const { user, isAdmin, logout } = useAuth();
  const isAuthenticated = !!user;

  // We will get cartCount from a useCart hook later.
  const cartCount = 0; 

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <div className="flex-1 md:flex-none">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* You can add an SVG logo here if you have one */}
            <span className="font-bold sm:inline-block font-headline text-lg">Cove</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
             <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Shopping cart">
                <div className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Button>
            </Link>
            {isAuthenticated ? (
                <>
                {isAdmin && (
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" size="icon" aria-label="Admin Dashboard">
                            <LayoutDashboard className="h-5 w-5" />
                        </Button>
                    </Link>
                )}
                 <Link href="/account">
                    <Button variant="ghost" size="icon" aria-label="My Account">
                        <User className="h-5 w-5" />
                    </Button>
                 </Link>
                <Button variant="ghost" size="icon" aria-label="Logout" onClick={logout}>
                    <LogOut className="h-5 w-5" />
                </Button>
                </>
            ) : (
                <Link href="/login">
                    <Button variant="ghost" className="text-sm">Login</Button>
                </Link>
            )}
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    <SheetClose asChild>
                        <Link href="/">Cove</Link>
                    </SheetClose>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col px-4 gap-4 py-8">
                    <SheetClose asChild>
                      <Link href="/cart" className="flex items-center gap-2 text-lg font-medium">
                        <ShoppingBag className="h-5 w-5" />
                        Cart ({cartCount})
                      </Link>
                    </SheetClose>
                  <Separator />
                  {isAuthenticated ? (
                    <>
                     <SheetClose asChild>
                       <Link href="/account" className="flex items-center gap-2 text-lg font-medium">
                         <User className="h-5 w-5" />
                         My Account
                       </Link>
                     </SheetClose>
                     {isAdmin && (
                        <SheetClose asChild>
                          <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-medium">
                            <LayoutDashboard className="h-5 w-5" />
                            Admin
                          </Link>
                        </SheetClose>
                     )}
                     <Separator />
                     <button onClick={() => logout()} className="flex w-full items-center gap-2 text-lg font-medium text-destructive">
                       <LogOut className="h-5 w-5" />
                       Logout
                     </button>
                    </>
                  ) : (
                    <SheetClose asChild>
                       <Link href="/login" className="flex items-center gap-2 text-lg font-medium">
                         <User className="h-5 w-5" />
                         Login / Sign Up
                       </Link>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}