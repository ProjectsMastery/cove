// src/app/admin/layout.tsx
import { Inter, Sora } from 'next/font/google'; // Import all fonts here

// This layout is simple. Its only job is to define the structure
// for the admin section, without the storefront's Header and Footer.
// It inherits the AuthProvider from the root layout.

// Define all fonts that the platform will support
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <>
   <div lang="en" className={`light ${inter.variable} ${sora.variable}`}>
  {children}
   </div>
  </>
  )
}