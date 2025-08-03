"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { getProductsForStore, getCategoriesForStore, deleteCategory, deleteProduct, deleteStore } from '@/lib/products';
import { useRouter } from 'next/navigation'; // <-- Import useRouter
import type { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useParams } from 'next/navigation';

export default function StoreDashboardPage() {
  const { role, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const storeId = params.storeId as string;
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State for the dialogs
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchData = useCallback(async () => {
    if (!storeId) return;
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
  }, [storeId]);

  useEffect(() => {
    const userIsAdmin = role === 'admin' || role === 'superadmin';
    if (!isAuthLoading && userIsAdmin) {
      fetchData();
    }
  }, [isAuthLoading, role, fetchData]);

  // Handler functions for all CRUD operations
  const handleAddProductClick = () => { setSelectedProduct(null); setIsProductDialogOpen(true); };
  const handleEditProductClick = (product: Product) => { setSelectedProduct(product); setIsProductDialogOpen(true); };
  const handleProductDialogClose = (wasSaved: boolean) => { setIsProductDialogOpen(false); if (wasSaved) fetchData(); };
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId, storeId);
      toast.success("Product deleted.");
      fetchData();
    } catch (error: any) { toast.error("Failed to delete product.", { description: error.message }); }
  };

  const handleAddCategoryClick = () => { setSelectedCategory(null); setIsCategoryDialogOpen(true); };
  const handleEditCategoryClick = (category: Category) => { setSelectedCategory(category); setIsCategoryDialogOpen(true); };
  const handleCategoryDialogClose = (wasSaved: boolean) => { setIsCategoryDialogOpen(false); if (wasSaved) fetchData(); };
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId, storeId); // Pass storeId for revalidation
      toast.success("Category deleted.");
      fetchData();
    } catch (error: any) { toast.error("Failed to delete category.", { description: error.message }); }
  };

  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'Uncategorized';

  const userIsAdmin = role === 'admin' || role === 'superadmin';
  if (isAuthLoading || !userIsAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const handleDeleteStore = async () => {
    if (!storeId) return;

    const result = await deleteStore(storeId);
    if (result.success) {
      toast.success("Store deleted successfully.");
      // On success, redirect the user back to the main admin dashboard.
      router.push('/admin/dashboard');
    } else {
      toast.error("Failed to delete store.", { description: result.error });
    }
  };


  return (
    <>
      <div className="space-y-8 p-8"> {/* <-- Added p-8 as you requested! */}
        <Card>
          <CardHeader>
            <CardTitle>Store Dashboard</CardTitle>
            <CardDescription>Managing products and categories for store ID: {storeId.slice(0, 8)}...</CardDescription>
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
                <Button onClick={handleAddProductClick} className='cursor-pointer'>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingData ? (
                      <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProductClick(product)} className="cursor-pointer"><Edit className="h-4 w-4 cur" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive cursor-pointer"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90 cursor-pointer">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div><CardTitle>Categories</CardTitle></div>
                <Button size="sm" onClick={handleAddCategoryClick} className='cursor-pointer'><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : categories.map(category => (
                  <div key={category.id} className="flex justify-between items-center p-2 group">
                    <span>{category.name}</span>
                    <div className="flex transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => handleEditCategoryClick(category)}><Edit className="h-4 w-4 cursor-pointer" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive cursor-pointer"><Trash2 className="h-4 w-4 cursor-pointer" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90 cursor-pointer">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        <Card className="border-destructive">
          <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Actions taken here are permanent and cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-destructive/20 p-4">
                  <div>
                      <h3 className="font-semibold">Delete This Store</h3>
                      <p className="text-sm text-muted-foreground">This will permanently remove this store and all its products and categories.</p>
                  </div>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="mt-4 sm:mt-0 cursor-pointer">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Delete Store
                          </Button>
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

      <ProductDialog isOpen={isProductDialogOpen} onClose={handleProductDialogClose} product={selectedProduct} categories={categories} storeId={storeId} />
      <CategoryDialog isOpen={isCategoryDialogOpen} onClose={handleCategoryDialogClose} category={selectedCategory} storeId={storeId} />
    </>
  );
}