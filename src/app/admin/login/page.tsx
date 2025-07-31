// src/app/admin/login/page.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // src/app/admin/login/page.tsx

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // VVV THIS IS THE FIX VVV
    // We call the login function but we DO NOT await it in a way that
    // can be cancelled. We use .then() to handle the promise.
    login(email, password).then(result => {
      // We only care about the result if it was an ERROR.
      if (!result.success) {
        toast.error("Login Failed", {
          description: result.error || "Invalid credentials or not an admin.",
        });
        // It's crucial to turn off the loader on failure.
        setIsLoading(false);
      }
      // On SUCCESS, we do absolutely nothing. The "Traffic Cop" in useAuth
      // has already started the redirect, and this component is about to disappear.
      // If we tried to `setIsLoading(false)` here, it would cause a React error.
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <Link href="/" className="font-bold sm:inline-block font-headline text-2xl mb-2">
                Cove
            </Link>
            <CardTitle className="text-2xl font-headline">Store Owner Login</CardTitle>
            <CardDescription>Enter your credentials to manage your store.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {/* This can later link to a contact or support page */}
              Don't have a store?{' '}
              <Link href="/" className="underline hover:text-primary">
                Learn More
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}