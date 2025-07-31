// src/app/(storefront)/page.tsx

import { getCategories, getProducts } from '@/lib/products';
import { ProductSearch } from '@/components/product-search';
import { ProductList } from '@/components/product-list';

// This is a Server Component. It can and should be async.
export default async function HomePage({ 
  searchParams 
}: { 
  // The searchParams are passed as props, already parsed by Next.js
  searchParams?: { q?: string; category?: string; };
}) {
  // --- VVV THIS IS THE FIX VVV ---
  // We can now access the properties directly and safely.
  const searchQuery = searchParams?.q || undefined;
  const categoryId = searchParams?.category || undefined;

  // We fetch the data directly on the server.
  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({ searchQuery, categoryId }),
    getCategories()
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  if (!productsResult.success) {
    console.error("Home Page - Failed to fetch products:", productsResult.error);
  }
  if (!categoriesResult.success) {
    console.error("Home Page - Failed to fetch categories:", categoriesResult.error);
  }
  
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-headline lg:text-5xl">
          Discover Something New
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
          Curated essentials for a modern lifestyle.
        </p>
      </section>

      <ProductSearch categories={categories} />
      
      <ProductList products={products} />
      
    </div>
  );
}