// src/app/admin/dashboard/create-store-form.tsx
"use client";

import { Button } from '@/components/ui/button';
import { 
   Card,
   CardContent,
   CardDescription,
   CardFooter, CardHeader, 
   CardTitle 
  } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useActionState } from 'react'; // <-- VVV THE FIX: Import the new hook from 'react'
import {  useFormStatus } from 'react-dom';
import { createStore } from '@/lib/stores'; // We will create this action next

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create My Store
    </Button>
  );
}

export function CreateStoreForm() {
  const [state, formAction] = useActionState(createStore, { success: false, error: null });

  if (state.success) {
    toast.success("Store created successfully!", {
      description: "Your dashboard is now active. Please refresh the page.",
    });
    // A full page refresh is the easiest way to reload the auth context
    // and show the new StoreDashboard component.
    window.location.reload();
  } else if (state.error) {
    toast.error("Failed to create store", {
      description: state.error,
    });
  }

  return (
    <div className="flex justify-center items-center py-8">
        <Card className="w-full max-w-lg">
            <form action={formAction}>
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome! Let's set up your store.</CardTitle>
                    <CardDescription>
                        You're almost ready to start selling. Just give your store a name.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="storeName">Store Name</Label>
                        <Input
                            id="storeName"
                            name="storeName"
                            placeholder="e.g., The Cozy Corner"
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}