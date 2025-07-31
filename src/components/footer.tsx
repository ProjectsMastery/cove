// src/components/footer.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAdmin } = useAuth();

  return (
    <footer className="bg-background/80 mt-12 border-t">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <p className="text-sm text-foreground/60">© {currentYear} Cove. All Rights Reserved.</p>
            <div className="flex mt-4 -mx-2 sm:mt-0">
                {isAdmin && (
                  <Link href="/admin/dashboard" className="mx-2 text-sm text-foreground/60 hover:text-foreground" aria-label="Admin Dashboard">
                    Admin Dashboard
                  </Link>
                )}
            </div>
        </div>
      </div>
    </footer>
  );
}