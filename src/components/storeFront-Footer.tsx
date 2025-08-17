// src/components/storefront-footer.tsx
"use client";

interface StorefrontFooterProps {
  storeName: string;
  theme: {
    footerBgColor?: string;
    // ... other theme props
  };
}

export function StorefrontFooter({ storeName, theme }: StorefrontFooterProps) {
  return (
    <footer style={{ backgroundColor: theme.footerBgColor || '#F9FAFB' }} className="border-t">
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        <p className="text-sm">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}