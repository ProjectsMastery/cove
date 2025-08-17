// src/app/(storefront)/store/[storeid]/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { StorefrontHeader } from '@/components/storeFront-header';
import { StorefrontFooter } from '@/components/storeFront-Footer';
import { notFound } from 'next/navigation';

// Helper function to generate the background style
const getBackgroundStyle = (background: any) => {
  if (!background || !background.type) return { backgroundColor: '#FFFFFF' };
  switch (background.type) {
    case 'gradient':
      return { backgroundImage: `linear-gradient(${background.angle || 'to bottom right'}, ${background.from || '#FFFFFF'}, ${background.to || '#E5E7EB'})` };
    case 'image':
      return { backgroundImage: `url(${background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    default:
      return { backgroundColor: background.value || '#FFFFFF' };
  }
};

export default async function StorefrontLayout({
  children,
  params,
  searchParams
}: {
  children: React.ReactNode;
  params: { storeId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

  const { data: store } = await supabase.from('stores').select('name').eq('id', params.storeId).single();
  const { data: themeSettings } = await supabase.from('theme_settings').select('*').eq('store_id', params.storeId).single();

  if (!store) {
    notFound();
  }

  const isPreviewMode = searchParams?.preview === 'true';

  const theme = {
    ...(isPreviewMode ? themeSettings?.draft_settings : themeSettings?.published_settings) || {},
    logoUrl: isPreviewMode ? themeSettings?.draft_logo_url : themeSettings?.published_logo_url,
    headerBgColor: isPreviewMode ? themeSettings?.draft_header_bg_color : themeSettings?.published_header_bg_color,
    footerBgColor: isPreviewMode ? themeSettings?.draft_footer_bg_color : themeSettings?.published_footer_bg_color,
    background: isPreviewMode ? themeSettings?.draft_background : themeSettings?.published_background,
  };

  const fontFamily = theme.fontFamily || 'Inter';
  const themeStyles = {
    '--primary-color': theme.primaryColor || '#6D28D9',
    '--header-bg-color': theme.headerBgColor || '#FFFFFF',
    '--footer-bg-color': theme.footerBgColor || '#F9FAFB',
} as React.CSSProperties;
  
  const backgroundStyle = getBackgroundStyle(theme.background);

  return (
    // This is now a simple div, NOT an html document. This is the fix.
    <div style={themeStyles} className='bg-dark-bg flex flex-col min-h-screen'>
        {/* We apply the background to a self-contained wrapper */}
        <div style={backgroundStyle} className="min-h-screen">
            <StorefrontHeader storeName={store.name} theme={theme} />
            <main className="flex-1">
                {children}
            </main>
            <StorefrontFooter storeName={store.name} theme={theme} />
        </div>

        {isPreviewMode && (
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        window.addEventListener('message', function(event) {
                            const { type, payload } = event.data;
                            if (type === 'THEME_UPDATE') {
                                if (payload.primaryColor) {
                                    document.documentElement.style.setProperty('--primary-color', payload.primaryColor);
                                }
                                if (payload.background) {
                                    const bodyWrapper = document.querySelector('body > div > div'); // Find the correct wrapper
                                    if (bodyWrapper) {
                                        if (payload.background.type === 'color') {
                                            bodyWrapper.style.backgroundImage = '';
                                            bodyWrapper.style.backgroundColor = payload.background.value;
                                        }
                                        // Add other cases for gradient, etc.
                                    }
                                }
                            }
                        });
                    `,
                }}
            />
        )}
    </div>
  );
}