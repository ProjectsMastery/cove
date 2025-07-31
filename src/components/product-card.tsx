// src/components/product-card.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner'; // <-- Import the new toast function directly from sonner
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  
  const handleAddToCart = () => {
    // TODO: Add actual cart logic here.
    
    // VVV The new, simpler way to call a toast VVV
    toast.success("Added to cart!", {
      description: `${product.name} is now in your shopping cart.`,
    });
  };

  const imageUrl = (product.imageUrls && product.imageUrls.length > 0) 
    ? product.imageUrls[0] 
    : 'https://placehold.co/600x600.png';

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-sm transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl bg-card border-border">
      <Link href={`/products/${product.id}`} className="block" aria-label={`View details for ${product.name}`}>
        <CardContent className="p-0">
          <div className="relative w-full aspect-square">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        </CardContent>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <CardTitle className="text-xl font-medium font-headline tracking-normal">
            <Link href={`/products/${product.id}`}>
                {product.name}
            </Link>
        </CardTitle>
        <CardDescription className="mt-2 text-base text-foreground/80">
          Price: {product.price} 
        </CardDescription>
        <CardFooter className="p-0 mt-auto pt-4">
          <Button onClick={handleAddToCart} className="w-full" disabled={product.stock === 0}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}