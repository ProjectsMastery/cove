"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Edit, Trash2, ArrowLeft, Settings } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { getProductsForStore, getCategoriesForStore, deleteCategory, deleteProduct } from '@/lib/products';
import type { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CategoryDialog } from '@/app/admin/dashboard/category-dialog';
import { ProductDialog } from '@/app/admin/dashboard/product-dialog';
import { SalesChart } from './sales-chart';
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
import Link from 'next/link';

export default function StoreDashboardPage() {
  const { role, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const storeId = params.storeId as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Dialog states
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

  // CRUD Handlers
  const handleAddProductClick = () => { setSelectedProduct(null); setIsProductDialogOpen(true); };
  const handleEditProductClick = (product: Product) => { setSelectedProduct(product); setIsProductDialogOpen(true); };
  const handleProductDialogClose = (wasSaved: boolean) => { setIsProductDialogOpen(false); setSelectedProduct(null); if (wasSaved) fetchData(); };
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId, storeId);
      toast.success("Product deleted.");
      fetchData();
    } catch (error: any) { toast.error("Failed to delete product.", { description: error.message }); }
  };

  const handleAddCategoryClick = () => { setSelectedCategory(null); setIsCategoryDialogOpen(true); };
  const handleEditCategoryClick = (category: Category) => { setSelectedCategory(category); setIsCategoryDialogOpen(true); };
  const handleCategoryDialogClose = (wasSaved: boolean) => { setIsCategoryDialogOpen(false); setSelectedCategory(null); if (wasSaved) fetchData(); };
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId, storeId);
      toast.success("Category deleted.");
      fetchData();
    } catch (error: any) { toast.error("Failed to delete category.", { description: error.message }); }
  };

  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'Uncategorized';

  const userIsAdmin = role === 'admin' || role === 'superadmin';
  if (isAuthLoading || !userIsAdmin) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="space-y-8 p-4 sm:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Stores
            </Link>
            <h1 className="text-3xl font-headline font-bold text-white">Store Dashboard</h1>
            <p className="text-muted-foreground">Manage products and categories for this store.</p>
          </div>
          <Link href={`/admin/stores/${storeId}/settings`}>
            <Button variant="outline" className="text-white cursor-pointer"><Settings className="mr-2 h-4 w-4" />Store Settings</Button>
          </Link>
        </header>

        {isLoadingData ? (
            <Card><CardHeader><CardTitle>Loading Overview...</CardTitle></CardHeader><CardContent><div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div></CardContent></Card>
        ) : (
          <SalesChart />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
             <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                  <div><CardTitle>Products</CardTitle><CardDescription>{products.length} products in your catalog.</CardDescription></div>
                  <Button onClick={handleAddProductClick}><PlusCircle className="mr-2 h-4 w-4" />Add Product</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[64px] sm:table-cell">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingData ? (
                      <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell"><Image src={product.imageUrls?.[0] || 'https://placehold.co/100x100.png'} alt={product.name} width={40} height={40} className="rounded-md object-cover aspect-square" /></TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProductClick(product)}><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
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
                  <div><CardTitle>Categories</CardTitle><CardDescription>{categories.length} categories.</CardDescription></div>
                  <Button size="sm" onClick={handleAddCategoryClick}><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
              </CardHeader>
              <CardContent>
                {isLoadingData ? ( <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div> ) : 
                categories.length > 0 ? (
                    categories.map(category => (
                        <div key={category.id} className="flex justify-between items-center p-2 group hover:bg-accent rounded-md">
                          <span>{category.name}</span>
                          <div className="flex">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCategoryClick(category)}><Edit className="h-4 w-4" /></Button>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                  <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this category.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          </div>
                        </div>
                    ))
                ) : ( <p className="text-sm text-center text-muted-foreground py-4">No categories created yet.</p> )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ProductDialog isOpen={isProductDialogOpen} onClose={handleProductDialogClose} product={selectedProduct} categories={categories} storeId={storeId} />
      <CategoryDialog isOpen={isCategoryDialogOpen} onClose={handleCategoryDialogClose} category={selectedCategory} storeId={storeId} />
    </>
  );
}