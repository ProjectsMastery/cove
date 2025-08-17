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
  const bgColor = theme.footerBgColor || '#121212';

  return (
    <footer
      style={{ backgroundColor: bgColor }}
      className="border-t border-[#2c2c2c] text-white shadow-[0_-2px_10px_rgba(0,0,0,0.4)]"
    >
      <div className="container mx-auto py-6 text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
