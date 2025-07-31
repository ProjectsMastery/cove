// src/app/account/page.tsx
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// We will create these files/functions later
// import { getOrdersForUser } from '@/lib/orders';
// import type { Order } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function AccountPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]); // Using 'any' for now
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // This effect will fetch data specific to the logged-in user.
  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        setIsLoadingOrders(true);
        // const userOrders = await getOrdersForUser(user.uid);
        // setOrders(userOrders);
        
        // --- MOCK DATA FOR NOW ---
        // Since we haven't built the orders system yet, we'll use fake data.
        setTimeout(() => {
            setOrders([]); // Simulate having no orders yet
            setIsLoadingOrders(false);
        }, 1000);
      }
    }
    fetchOrders();
  }, [user]);

  // The guard clause: while auth is loading, show a full-page loader.
  // The "Traffic Cop" in useAuth will handle redirects if the user is not authenticated.
  if (isAuthLoading) {
    return (
       <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  // If we reach this point, the user is confirmed to be authenticated.
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline">My Account</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}!</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Here are the orders you've placed with us.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                {/* We will build this part out when we do the checkout flow */}
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">You haven't placed any orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}