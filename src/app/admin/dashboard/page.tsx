"use client";

import { useAuth } from '@/hooks/use-auth';
import { Loader2, PlusCircle, StoreIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Store } from '@/lib/types';
import { getStoresForAdmin } from '@/lib/stores';
import { toast } from 'sonner';
import { CreateStoreDialog } from './create-store-dialog'; 

export default function AdminDashboardPage() {
  // We are ONLY getting the authentication state. No data fetching yet.
  const { user, role, isLoading: isAuthLoading } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);

 // We define fetchStores as a standalone, memoized function using useCallback.
  // This makes it stable and callable from anywhere in our component.
  const fetchStores = useCallback(async () => {
    setIsLoadingStores(true);
    const result = await getStoresForAdmin();
    if (result.success && result.data) {
      setStores(result.data);
    } else {
      toast.error("Could not load your stores", { description: result.error });
    }
    setIsLoadingStores(false);
  }, []); // It has no dependencies, so it's created only once.


  // The initial data fetching effect now simply calls our stable fetchStores function.
  useEffect(() => {
    if (!isAuthLoading && (role === 'admin' || role === 'superadmin')) {
      fetchStores();
    } else if (!isAuthLoading) {
      setIsLoadingStores(false);
    }
  }, [isAuthLoading, role, fetchStores]); // We add fetchStores to the dependency array.

  // The guard clause: while the auth check is running, we show a loader.
  // The "Traffic Cop" in useAuth will redirect anyone who shouldn't be here.
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // A fallback in case the redirect is slow.
  if (!user || (role !== 'admin' && role !== 'superadmin')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Access Denied. Redirecting...</p>
      </div>
    );
  }

  const handleDialogClose = () => {
    setIsCreateStoreOpen(false);
    fetchStores();
}

  // If the code reaches here, it means the auth check is complete and successful.
  // We will render a very simple page to prove it.
  return (
    <>
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        {/* We keep the simple "Welcome" card for now */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>
              Welcome! Email: <strong>{user?.email}</strong>, Role: <strong>{role}</strong>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* --- VVV This is the new Stores Management Panel VVV --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Stores</CardTitle>
              <CardDescription>Select a store to manage or create a new one.</CardDescription>
            </div>
            {/* The button is disabled for now until we add the dialog back */}
            <Button onClick={() => setIsCreateStoreOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Store
              </Button>
          </CardHeader>
          <CardContent>
            {isLoadingStores ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : stores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map(store => (
                  <Link key={store.id} href={`/admin/stores/${store.id}/dashboard`}>
                    <div className="p-4 border rounded-lg hover:bg-accent transition-colors h-full">
                      <div className="flex items-center gap-4">
                        <StoreIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{store.name}</p>
                          <p className="text-sm text-muted-foreground">Click to manage</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-medium">You haven't created any stores yet.</h3>
                <p className="mt-2 text-muted-foreground">Click the "Create New Store" button to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
    </div>
      {/* --- VVV We now render the dialog and pass it the correct functions VVV --- */}
      <CreateStoreDialog isOpen={isCreateStoreOpen} onClose={handleDialogClose} />
      </>
  );
}