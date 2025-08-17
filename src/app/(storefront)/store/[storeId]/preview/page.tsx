// src/app/(storefront)/store/[storeId]/preview/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getThemeSettings } from '@/lib/themes';
import type { ThemeSettings } from '@/lib/types';
import { StorefrontHeader } from '@/components/storeFront-header';
import { StorefrontFooter } from '@/components/storeFront-Footer';
import { Loader2 } from 'lucide-react';
// We'll also need to fetch the store name for the header.
import { createClient } from '@/lib/supabase/client';

export default function PreviewPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [theme, setTheme] = useState<any | null>(null);
  const [storeName, setStoreName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once to fetch the initial DRAFT theme.
  useEffect(() => {
    if (storeId) {
      const supabase = createClient();
      // Fetch initial store name
      supabase.from('stores').select('name').eq('id', storeId).single().then(({ data }) => {
        if (data) setStoreName(data.name);
      });
      // Fetch initial theme settings
      getThemeSettings(storeId).then(result => {
        if (result.success && result.data) {
          const draftTheme = {
            ...(result.data.draft_settings || {}),
            logoUrl: result.data.draft_logo_url,
            headerBgColor: result.data.draft_header_bg_color,
            footerBgColor: result.data.draft_footer_bg_color,
            background: result.data.draft_background,
          };
          setTheme(draftTheme);
        }
        setIsLoading(false);
      });
    }
  }, [storeId]);

  // This effect sets up the listener for REAL-TIME updates from the customizer.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'THEME_UPDATE') {
        // We merge the new change into our existing theme state.
        setTheme((prevTheme: any) => ({ ...prevTheme, ...payload }));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isLoading || !theme) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }
  
  const fontFamily = theme.fontFamily || 'Inter';
  const themeStyles = {
      '--primary-color': theme.primaryColor || '#6D28D9',
      '--header-bg-color': theme.headerBgColor || '#FFFFFF',
      '--footer-bg-color': theme.footerBgColor || '#F9FAFB',
      'fontFamily': `var(--font-${fontFamily.toLowerCase()})`,
  } as React.CSSProperties;

 // In src/app/(storefront)/store/[storeId]/preview/page.tsx

// A helper function to generate the background style based on the theme object
const getBackgroundStyle = (background: any): React.CSSProperties => {
  if (!background || !background.type) {
    return { backgroundColor: '#FFFFFF' }; // Always return a valid object
  }

  switch (background.type) {
    case 'gradient':
      return { backgroundImage: `linear-gradient(${background.angle || 'to bottom right'}, ${background.from || '#FFFFFF'}, ${background.to || '#E5E7EB'})` };
    case 'image':
      return { 
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    case 'color':
    default:
      return { backgroundColor: background.value || '#FFFFFF' };
  }
};
  const backgroundStyle = getBackgroundStyle(theme.background);

  return (
    <div style={themeStyles}>
      <div style={backgroundStyle} className="min-h-screen">
        <StorefrontHeader storeName={storeName} theme={theme} />
        {/* We can put placeholder content here or fetch real products */}
        <div className="text-center p-10">
          <h2 className="text-2xl font-bold">Your Products Will Appear Here</h2>
          <p className="text-muted-foreground">This is a live preview of your store's theme.</p>
        </div>
        <StorefrontFooter storeName={storeName} theme={theme} />
      </div>
    </div>
  );
}