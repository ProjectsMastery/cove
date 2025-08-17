// src/app/(storefront)/[storeId]/page.tsx

import { getProductsForStore, getCategoriesForStore } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, Category } from '@/lib/types';
import  StorefrontSearch  from "../StorefrontSearch";

// --- A New, More Detailed Product Card ---
function StorefrontProductCard({ product }: { product: Product }) {
  const imageUrl = (product.imageUrls && product.imageUrls.length > 0) 
    ? product.imageUrls[0] 
    : 'https://placehold.co/600x600.png';

  // Helper to format currency. We will build a more robust version later.
  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="aspect-square bg-muted">
        <Image
          src={imageUrl}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium">
          <Link href="#">
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="flex flex-1 flex-col justify-end">
            <p className="text-base font-semibold" style={{ color: 'var(--primary-color)' }}>
                {formatCurrency(product.price)}
            </p>
        </div>
      </div>
    </div>
  );
}




// This is the main Server Component for the store's home page.
export default async function StorePage({
  params,
  searchParams
}: {
  params: { storeId: string };
  searchParams?: { q?: string; category?: string; };
}) {
  const { storeId } = params;
  if (!storeId) notFound();

  const searchQuery = searchParams?.q;
  const categoryId = searchParams?.category;

  // Fetch data using the search and category filters.
  const [productsResult, categoriesResult] = await Promise.all([
    getProductsForStore(storeId, { searchQuery, categoryId }), // Pass filters to the fetcher
    getCategoriesForStore(storeId),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div style={{ fontFamily: 'var(--font-family-body)' }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* We now include the search and filter component */}
        <StorefrontSearch categories={categories} />

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <StorefrontProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-10 text-center text-muted-foreground">
            <p>No products match your search. Try a different query or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}