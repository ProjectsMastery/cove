// src/app/admin/dashboard/page.tsx
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Loader2, PlusCircle, Store as StoreIcon, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Store } from '@/lib/types';
import { getStoresForAdmin } from '@/lib/stores';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CreateStoreDialog } from './create-store-dialog';

export default function AdminDashboardPage() {
  const { user, role, isLoading: isAuthLoading } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && (role === 'admin' || role === 'superadmin')) {
      const fetchStores = async () => {
        setIsLoadingStores(true);
        const result = await getStoresForAdmin();
        if (result.success && result.data) {
          setStores(result.data);
        } else {
          toast.error("Could not load your stores", { description: result.error });
        }
        setIsLoadingStores(false);
      };
      fetchStores();
    }
  }, [isAuthLoading, role]);

  // The guard clause.
  if (isAuthLoading || (role !== 'admin' && role !== 'superadmin')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Super Admin specific UI Panel */}
        {role === 'superadmin' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Super Admin Tools</CardTitle>
              <CardDescription>Create and manage new stores and their owners.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin-signup">
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Create New Admin & Store
                  </Button>
              </Link>
            </CardContent>
          </Card>
        )}

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
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : stores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map(store => (
                  <Link key={store.id} href={`/admin/stores/${store.id}/dashboard`}>
                    <div className="p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors h-full">
                      <div className="flex items-center gap-4">
                        <StoreIcon className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
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
                <p className="text-lg font-medium">You don't have any stores yet.</p>
                <p className="mt-2 text-muted-foreground">Click the "Create New Store" button to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* This renders our "Create Store" dialog, which is now a child of this page */}
      <CreateStoreDialog isOpen={isCreateStoreOpen} onClose={() => setIsCreateStoreOpen(false)} />
    </>
  );
}