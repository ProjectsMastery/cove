// src/app/admin/dashboard/store-dashboard.tsx
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProducts, getCategories, deleteCategory, deleteProduct } from '@/lib/products';
import type { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CategoryDialog } from './category-dialog';
import { ProductDialog } from './product-dialog';
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
import Link from 'next/link';

interface StoreDashboardProps {
    userRole: 'admin' | 'superadmin' | 'user' | null;
}

export function StoreDashboard({ userRole }: StoreDashboardProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            const [productsResult, categoriesResult] = await Promise.all([
                getProducts(),
                getCategories()
            ]);

            if (productsResult.success) {
                setProducts(productsResult.data);
            } else {
                toast.error("Failed to load products", { description: productsResult.error });
            }

            if (categoriesResult.success) {
                setCategories(categoriesResult.data);
            } else {
                toast.error("Failed to load categories", { description: categoriesResult.error });
            }
        } catch (error) {
            toast.error("An unexpected error occurred", { description: "Could not fetch dashboard data." });
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Product Handlers
    const handleAddProductClick = () => {
        setSelectedProduct(null);
        setIsProductDialogOpen(true);
    };
    const handleEditProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsProductDialogOpen(true);
    };
    const handleProductDialogClose = (wasSaved: boolean) => {
        setIsProductDialogOpen(false);
        setSelectedProduct(null);
        if (wasSaved) fetchData();
    };
    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteProduct(productId);
            toast.success("Product deleted successfully.");
            fetchData();
        } catch (error: any) {
            toast.error("Failed to delete product.", { description: error.message });
        }
    };

    // Category Handlers
    const handleAddCategoryClick = () => {
        setSelectedCategory(null);
        setIsCategoryDialogOpen(true);
    };
    const handleEditCategoryClick = (category: Category) => {
        setSelectedCategory(category);
        setIsCategoryDialogOpen(true);
    };
    const handleCategoryDialogClose = (wasSaved: boolean) => {
        setIsCategoryDialogOpen(false);
        setSelectedCategory(null);
        if (wasSaved) fetchData();
    };
    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await deleteCategory(categoryId);
            toast.success("Category deleted successfully.");
            fetchData();
        } catch (error: any) {
            toast.error("Failed to delete category.", { description: error.message });
        }
    };

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
    };

    return (
        <>
            <div className="space-y-8">
                {/* Super Admin specific UI */}
                {userRole === 'superadmin' && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle>Super Admin Tools</CardTitle>
                            <CardDescription>Create and manage new stores and their owners.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/admin-signup">
                                <Button>Create New Admin & Store</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Products</CardTitle>
                            <CardDescription>Number of products in this store.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{isLoadingData ? <Loader2 className="h-8 w-8 animate-spin" /> : products.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Categories</CardTitle>
                            <CardDescription>Number of categories in this store.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{isLoadingData ? <Loader2 className="h-8 w-8 animate-spin" /> : categories.length}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle>Products</CardTitle>
                                    <CardDescription>Manage your product catalog.</CardDescription>
                                </div>
                                <Button onClick={handleAddProductClick}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="hidden w-[80px] sm:table-cell">Image</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingData ? (
                                            <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                                        ) : products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="hidden sm:table-cell"><Image src={product.imageUrls?.[0] || ''} alt={product.name} width={50} height={50} className="rounded-md object-cover aspect-square" /></TableCell>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                                                <TableCell>{product.price}</TableCell>
                                                <TableCell>{product.stock}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end"><Button variant="ghost" size="icon" onClick={() => handleEditProductClick(product)}><Edit className="h-4 w-4" /></Button>
                                                        <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
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
                                <div><CardTitle>Categories</CardTitle><CardDescription>Manage product categories.</CardDescription></div>
                                <Button onClick={handleAddCategoryClick} size="sm"><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {isLoadingData ? (
                                        <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                                    ) : categories.map(category => (
                                        <div key={category.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md group"><span>{category.name}</span>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCategoryClick(category)}><Edit className="h-4 w-4" /></Button>
                                                <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <CategoryDialog isOpen={isCategoryDialogOpen} onClose={handleCategoryDialogClose} category={selectedCategory} />
            <ProductDialog isOpen={isProductDialogOpen} onClose={handleProductDialogClose} product={selectedProduct} categories={categories} />
        </>
    );
}