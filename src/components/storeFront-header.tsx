// src/components/storefront-header.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';

interface StorefrontHeaderProps {
  storeName: string;
  theme: { logoUrl?: string | null; /* ... */ };
}

export function StorefrontHeader({ storeName, theme }: StorefrontHeaderProps) {
  return (
    // VVV Reads the CSS variable for its background VVV
    <header style={{ backgroundColor: 'var(--header-bg-color)' }} className="border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          {theme.logoUrl ? (
            <div className="relative h-10 w-32">
              {/* VVV Gives the logo a unique ID for our script to find VVV */}
              <Image id="store-logo-img" src={theme.logoUrl} alt={`${storeName} logo`} fill className="object-contain" />
            </div>
          ) : (
            <span id="store-logo-text" className="text-2xl font-bold font-headline">{storeName}</span>
          )}
        </Link>
      </div>
    </header>
  );
}