// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/use-auth';
// We remove Header and Footer from here.

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

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
    <html lang="en" className={`dark ${inter.variable} ${sora.variable}`}>
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