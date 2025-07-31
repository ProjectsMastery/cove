// src/app/admin/stores/[storeId]/dashboard/page.tsx
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
// VVV We import our new store-specific functions VVV
import { getProductsForStore, getCategoriesForStore, deleteCategory, deleteProduct } from '@/lib/products';
import type { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// VVV We will need these dialogs here now VVV
import { CategoryDialog } from '@/app/admin/dashboard/category-dialog';
import { ProductDialog } from '@/app/admin/dashboard/product-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import {
  AlertDialog,
  // ... other AlertDialog imports
} from "@/components/ui/alert-dialog";
import { useParams } from 'next/navigation'; // <-- Hook to get URL parameters

export default function StoreDashboardPage() {
  const { isLoading: isAuthLoading, role } = useAuth();
  const params = useParams(); // Get URL parameters
  const storeId = params.storeId as string; // Extract the storeId

  // State for this page's data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State for the dialogs
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // --- VVV And we check against the 'role' here VVV ---
    const userIsAdmin = role === 'admin' || role === 'superadmin';
    if (!isAuthLoading && userIsAdmin && storeId) {
      const fetchData = async () => {
        setIsLoadingData(true);
        const [productsResult, categoriesResult] = await Promise.all([
          getProductsForStore(storeId),
          getCategoriesForStore(storeId)
        ]);

        if (productsResult.success) setProducts(productsResult.data);
        else toast.error("Failed to load products", { description: productsResult.error });

        if (categoriesResult.success) setCategories(categoriesResult.data);
        else toast.error("Failed to load categories", { description: categoriesResult.error });

        setIsLoadingData(false);
      };
      fetchData();
    }
  }, [isAuthLoading, role, storeId]);

  // All the handler functions for products and categories will live here now.
  // (handleAddProductClick, handleDeleteProduct, handleAddCategoryClick, etc.)

  // --- VVV And finally, the guard clause checks the 'role' VVV ---
  const userIsAdmin = role === 'admin' || role === 'superadmin';
  if (isAuthLoading || !userIsAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    // This is a simplified layout. We will build out the full data tables next.
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Store Dashboard</CardTitle>
          <CardDescription>Managing products and categories for store ID: {storeId}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Manage your product catalog.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </CardHeader>
            <CardContent>
                {isLoadingData ? <p>Loading products...</p> : <p>{products.length} products loaded for this store.</p>}
            </CardContent>
          </Card>
        </div>
        <div>
           <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Manage product categories.</CardDescription>
                </div>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </CardHeader>
            <CardContent>
                {isLoadingData ? <p>Loading categories...</p> : <p>{categories.length} categories loaded for this store.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}