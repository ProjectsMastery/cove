// src/app/admin/stores/[storeId]/settings/page.tsx
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, AlertTriangle, Palette } from 'lucide-react';
import { deleteStore } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StoreSettingsPage() {
  const { role, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const handleDeleteStore = async () => {
    if (!storeId) return;
    const result = await deleteStore(storeId);
    if (result.success) {
      toast.success("Store deleted successfully.");
      router.push('/admin/dashboard');
    } else {
      toast.error("Failed to delete store.", { description: result.error });
    }
  };

  const userIsAdmin = role === 'admin' || role === 'superadmin';
  if (isAuthLoading || !userIsAdmin) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 p-4 sm:p-8">
      <Link href={`/admin/stores/${storeId}/dashboard`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store Dashboard
      </Link>
      
      <header>
        <h1 className="text-3xl font-headline font-bold text-white">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store's settings and advanced options.</p>
      </header>

      {/* We can add other settings cards here in the future, like for custom domains */}

      <Card>
          <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>Change your store's colors, fonts, and layout to match your brand.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                      <h3 className="font-semibold">Customize Your Storefront</h3>
                      <p className="text-sm text-muted-foreground">Open the theme editor to get started.</p>
                  </div>
                   <Link href={`/admin/stores/${storeId}/customize`}>
                        <Button variant="outline" className="text-white cursor-pointer">
                            <Palette className="mr-2 h-4 w-4" />
                            Open Customizer
                        </Button>
                   </Link>
              </div>
          </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Actions taken here are permanent and cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <h3 className="font-semibold">Delete This Store</h3>
                    <p className="text-sm text-muted-foreground">This will permanently remove this store and all of its data.</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="text-white cursor-pointer"><AlertTriangle className="mr-2 h-4 w-4" />Delete Store</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action is permanent. All products and categories within this store will be lost forever.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteStore} className="bg-destructive hover:bg-destructive/90">
                                Yes, Delete This Store
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}