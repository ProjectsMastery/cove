// src/app/(storefront)/layout.tsx
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

// This layout wraps all the customer-facing pages.
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}