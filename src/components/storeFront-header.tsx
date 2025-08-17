// src/components/storefront-header.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';

interface StorefrontHeaderProps {
  storeName: string;
  theme: {
    logoUrl?: string | null;
    headerBgColor?: string;
    // ... other theme props
  };
}

export function StorefrontHeader({
  storeName,
  theme
}: StorefrontHeaderProps) {
  // default to a dark charcoal if no headerBgColor is provided
  const bgColor = theme.headerBgColor ?? '#121212';

  return (
    <header
      style={{ backgroundColor: bgColor }}
      className="
        border-b border-[#2c2c2c]
        text-white
        shadow-[0_2px_10px_rgba(0,0,0,0.4)]
        transition-colors duration-300
      "
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          {theme.logoUrl ? (
            <div className="relative h-10 w-32">
              <Image
                id="store-logo-img"
                src={theme.logoUrl}
                alt={`${storeName} logo`}
                fill
                className="object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
          ) : (
            <span
              id="store-logo-text"
              className="text-2xl font-bold font-headline text-white"
            >
              {storeName}
            </span>
          )}
        </Link>

        {/* Example nav slot */}
        <nav className="flex items-center space-x-6">
          <Link href="/products" className="text-gray-300 hover:text-white">
            Products
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-white">
            About
          </Link>
          <Link href="/cart" className="text-gray-300 hover:text-white relative">
            <span className="sr-only">View cart</span>
            🛒
            {/* badge example */}
            <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black bg-[#00ffd1] rounded-full">
              3
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
