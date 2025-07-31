// src/app/admin-signup/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { registerAdminAndCreateStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useActionState  } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Admin & Store
    </Button>
  );
}

export default function AdminSignupPage() {
  const router = useRouter();
  // VVV THIS IS THE FIX: We now get the user's specific 'role' VVV
  const { role, isLoading: isAuthLoading } = useAuth();
  
  const [state, formAction] = useActionState(registerAdminAndCreateStore, { success: false, error: null });

  useEffect(() => {
    if (state.success) {
      toast.success("Admin and Store created successfully!", {
        description: `The new admin account is ready.`,
      });
      // Optionally, you could clear the form here if you plan to stay on the page.
    } else if (state.error) {
      toast.error("Registration Failed", {
        description: state.error,
      });
    }
  }, [state]);

  // --- THE SUPER ADMIN GUARD CLAUSE (using the new 'role') ---

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // After loading, we check if the user's role is specifically 'superadmin'.
  if (role !== 'superadmin') {
    return (
      <div className="flex h-screen items-center justify-center p-4">
          <Card className="w-full max-w-sm text-center">
            <CardHeader>
                <CardTitle className="flex justify-center items-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-destructive" />
                    Access Denied
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>You do not have permission to create new stores.</p>
            </CardContent>
            <CardFooter>
                 <Link href="/admin/dashboard" className="w-full">
                    <Button variant="outline" className="w-full">Back to Dashboard</Button>
                 </Link>
            </CardFooter>
          </Card>
      </div>
    )
  }
  
  // If we get here, the user is a confirmed super admin.
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Create New Store</CardTitle>
            <CardDescription>Create a new admin account and their associated store.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                name="storeName"
                placeholder="New Awesome Store"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">New Admin's Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/admin/dashboard" className="underline hover:text-primary">
                Back to Dashboard
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}