// src/components/product-list.tsx
"use client";

import { ProductCard } from '@/components/product-card'; // We will create this next
import type { Product } from '@/lib/types';

interface ProductListProps {
    products: Product[];
}

export function ProductList({ products }: ProductListProps) {
    if (products.length === 0) {
        return (
            <div className="text-center mt-12">
                <h2 className="text-2xl font-semibold">No Products Found</h2>
                <p className="mt-2 text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}