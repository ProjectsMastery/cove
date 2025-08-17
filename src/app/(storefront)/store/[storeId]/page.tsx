// src/app/(storefront)/[storeId]/page.tsx

import { getProductsForStore, getCategoriesForStore } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, Category } from '@/lib/types';
import StorefrontSearch from '../StorefrontSearch';

function StorefrontProductCard({ product }: { product: Product }) {
  const imageUrl = product.imageUrls?.[0] ?? 'https://placehold.co/600x600.png';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#1f1f1f] to-[#121212] text-white shadow-[0_4px_20px_rgba(0,0,0,0.6)] border border-[#2c2c2c] transition-all duration-300 hover:shadow-[0_6px_30px_rgba(0,0,0,0.8)]">
      <div className="aspect-square bg-[#2c2c2c] rounded-t-2xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <h3 className="text-lg font-semibold tracking-tight text-white">
          <Link href="#">
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2">{product.description}</p>
        <div className="flex flex-1 flex-col justify-end">
          <p className="text-base font-bold text-[#00ffd1] bg-[#0f0f0f] px-3 py-1 rounded-md w-fit">
            {formatCurrency(product.price)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function StorePage({
  params,
  searchParams
}: {
  params: { storeId: string };
  searchParams?: { q?: string; category?: string };
}) {
  const { storeId } = params;
  if (!storeId) notFound();

  const searchQuery = searchParams?.q;
  const categoryId = searchParams?.category;

  const [productsResult, categoriesResult] = await Promise.all([
    getProductsForStore(storeId, { searchQuery, categoryId }),
    getCategoriesForStore(storeId),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <StorefrontSearch categories={categories} />
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <StorefrontProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center text-gray-400">
            <Image
              src="/empty-box.svg"
              alt="No products"
              width={150}
              height={150}
              className="mx-auto mb-6 opacity-60"
            />
            <p className="text-xl font-medium">No products found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
