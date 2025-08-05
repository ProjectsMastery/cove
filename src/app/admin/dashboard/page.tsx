"use client";

import { useAuth } from '@/hooks/use-auth';
import { Loader2, PlusCircle, Store as StoreIcon, Users, ArrowRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import type { Store } from '@/lib/types';
import { getStoresForAdmin } from '@/lib/stores';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { CreateStoreDialog } from './create-store-dialog';

export default function AdminDashboardPage() {
  const { user, role, isLoading: isAuthLoading } = useAuth();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);

  const fetchStores = useCallback(async () => {
    setIsLoadingStores(true);
    const result = await getStoresForAdmin();
    if (result.success && result.data) {
      setStores(result.data);
    } else {
      toast.error("Could not load your stores", { description: result.error });
    }
    setIsLoadingStores(false);
  }, []);

  useEffect(() => {
    if (!isAuthLoading && (role === 'admin' || role === 'superadmin')) {
      fetchStores();
    }
  }, [isAuthLoading, role, fetchStores]);

  const handleDialogClose = () => {
      setIsCreateStoreOpen(false);
      fetchStores();
  }

  // The guard clause.
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-8 flex flex-col gap-8">
        {/* --- HEADER SECTION --- */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-headline font-bold text-white">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.email}</p>
            </div>
            {role === 'superadmin' && (
                <Link href="/admin-signup">
                    <Button variant="outline" className="text-white cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        Create New Admin
                    </Button>
                </Link>
            )}
        </header>

        {/* --- STORES LIST SECTION --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Stores</CardTitle>
              <CardDescription>Select a store to manage or create a new one.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateStoreOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Store
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingStores ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : stores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(store => (
                  <Card key={store.id} className="hover:border-primary/60 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <StoreIcon className="h-8 w-8 text-muted-foreground" />
                        <CardTitle className="font-headline">{store.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Created on: {new Date(store.created_at).toLocaleDateString()}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href={`/admin/stores/${store.id}/dashboard`} className="w-full">
                            <Button variant="secondary" className="w-full cursor-pointer">
                                Manage Store
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 border-2 border-dashed border-border rounded-lg">
                <StoreIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold font-headline">Welcome to Cove!</h3>
                <p className="mt-2 text-muted-foreground">You haven't created any stores yet.</p>
                <Button onClick={() => setIsCreateStoreOpen(true)} className="mt-6">
                    Create Your First Store
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <CreateStoreDialog isOpen={isCreateStoreOpen} onClose={handleDialogClose} />
    </>
  );
}