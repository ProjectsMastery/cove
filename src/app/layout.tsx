// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google'; // Import all fonts here
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/use-auth';

// Define all fonts that the platform will support
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'Cove',
  description: 'The All-in-One E-commerce Platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We apply all possible font variables to the root html tag
    <html lang="en" className={`dark ${inter.variable} ${sora.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}