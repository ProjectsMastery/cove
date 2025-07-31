// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/use-auth';
// We remove Header and Footer from here.

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Cove',
  description: 'Discover something new with Cove.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${inter.variable}`}>
      <body className="font-sans antialiased min-h-dvh bg-background">
        <AuthProvider>
          {/* The layout is now simpler. It just provides the auth context and toaster. */}
          {children}
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}