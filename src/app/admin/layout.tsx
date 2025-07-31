// src/app/admin/layout.tsx

// This layout is simple. Its only job is to define the structure
// for the admin section, without the storefront's Header and Footer.
// It inherits the AuthProvider from the root layout.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}