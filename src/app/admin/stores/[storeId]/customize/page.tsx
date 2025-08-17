// src/app/admin/stores/[storeid]/customize/page.tsx
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Eye, CheckCircle, Upload } from 'lucide-react';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { getThemeSettings, saveDraftTheme, publishTheme } from '@/lib/themes';
import type { ThemeSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDropzone } from 'react-dropzone';
import { getSignedUploadUrl } from '@/lib/upload';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { useThemeStore } from '@/lib/store/themeStore';

export default function CustomizePage() {
  const { role, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const storeId = params.storeId as string;
  const { setInitialTheme, updateTheme } = useThemeStore();

  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startSavingTransition] = useTransition();
  const [isPublishing, startPublishingTransition] = useTransition();

  // Send updates to the iframe for live preview
  const postThemeUpdate = (payload: any) => {
    const iframe = document.getElementById('store-preview') as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage({ type: 'THEME_UPDATE', payload }, '*');
  };

  // Load existing (or draft) settings
  useEffect(() => {
    if (!storeId) return;
    getThemeSettings(storeId).then((result) => {
      if (result.success && result.data) {
        setSettings(result.data);
        setInitialTheme(result.data);
      } else {
        toast.error('Failed to load theme settings', { description: result.error });
      }
      setIsLoading(false);
    });
  }, [storeId, setInitialTheme]);

  // Debounced draft save
  const debouncedSaveDraft = useDebouncedCallback(async (newSettings: ThemeSettings) => {
    startSavingTransition(async () => {
      const draftData = {
        draft_settings: newSettings.draft_settings,
        draft_logo_url: newSettings.draft_logo_url,
        draft_header_bg_color: newSettings.draft_header_bg_color,
        draft_footer_bg_color: newSettings.draft_footer_bg_color,
        draft_background: newSettings.draft_background,
      };
      const result = await saveDraftTheme(storeId, draftData);
      if (!result.success) {
        toast.error('Failed to save draft', { description: result.error });
      }
    });
  }, 1000);

  // Handle individual setting changes
  const handleSettingChange = (key: keyof ThemeSettings, value: any, nestedKey?: string) => {
    if (!settings) return;
    const newSettings = JSON.parse(JSON.stringify(settings));
    if (nestedKey) {
      if (!newSettings[key]) (newSettings as any)[key] = {};
      (newSettings as any)[key][nestedKey] = value;
    } else {
      (newSettings as any)[key] = value;
    }
    setSettings(newSettings);
    updateTheme(nestedKey ? { [nestedKey]: value } : { [key]: value });
    postThemeUpdate(nestedKey ? { [nestedKey]: value } : { [key]: value });
    debouncedSaveDraft(newSettings);
  };

  const onLogoDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !settings) return;
  
      toast.info('Uploading logo…');
  
      // 1) Grab the signed URL payload
      const urlResult = await getSignedUploadUrl(file.name);
  
      // 2) Guard against missing data
      if (
        !urlResult.success ||
        typeof urlResult.path !== 'string' ||
        typeof urlResult.token !== 'string'
      ) {
        const msg = urlResult.error ?? 'Could not get a valid upload URL';
        toast.error(msg);
        throw new Error(msg);
      }
  
      // 3) Now that TS knows path & token are strings, destructure
      const { path, token } = urlResult;
  
      try {
        const supabase = createClient();
  
        // 4) Upload using your signed URL
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .uploadToSignedUrl(path, token, file);
  
        if (uploadError) throw uploadError;
  
        // 5) Fetch the publicly available URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(path);
  
        // 6) Update state, preview, and draft
        const newSettings = { ...settings, draft_logo_url: publicUrl };
        setSettings(newSettings);
        updateTheme({ logoUrl: publicUrl });
        postThemeUpdate({ logoUrl: publicUrl });
        debouncedSaveDraft(newSettings);
  
        toast.success('Logo uploaded successfully');
      } catch (err: any) {
        toast.error('Logo upload failed', { description: err.message });
      }
    },
    [settings, debouncedSaveDraft, updateTheme]
  );
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  // Publish draft to live
  const handlePublish = () => {
    if (!settings) return;
    startPublishingTransition(async () => {
      const result = await publishTheme(storeId);
      if (result.success) {
        toast.success('Theme published!');
      } else {
        toast.error('Failed to publish', { description: result.error });
      }
    });
  };

  const userIsAdmin = role === 'admin' || role === 'superadmin';
  if (isAuthLoading || isLoading || !userIsAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-muted/40">
      {/* Sidebar for controls */}
      <aside className="flex flex-col w-80 border-r bg-background">
        <header className="p-4 border-b">
          <Link
            href={`/admin/stores/${storeId}/dashboard`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h2 className="text-xl font-headline font-semibold text-white">Customize Theme</h2>
        </header>

        <ScrollArea className="flex-1 p-4 sticky top-0 overflow-y-auto">
          <div className="space-y-6">
            {/* Branding Card */}
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Logo</Label>
                <div
                  {...getRootProps()}
                  className="flex justify-center items-center w-full h-32 px-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
                >
                  <input {...getInputProps()} />
                  {settings?.draft_logo_url ? (
                    <div className="relative h-20 w-40">
                      <Image
                        src={settings.draft_logo_url}
                        alt="Current Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click or drag to upload
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Colors Card */}
            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings?.draft_settings?.primaryColor || '#000000'}
                    onChange={(e) =>
                      handleSettingChange(
                        'draft_settings',
                        e.target.value,
                        'primaryColor'
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headerBgColor">Header Background</Label>
                  <Input
                    id="headerBgColor"
                    type="color"
                    value={settings?.draft_header_bg_color || '#121212'}
                    onChange={(e) =>
                      handleSettingChange('draft_header_bg_color', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerBgColor">Footer Background</Label>
                  <Input
                    id="footerBgColor"
                    type="color"
                    value={settings?.draft_footer_bg_color || '#121212'}
                    onChange={(e) =>
                      handleSettingChange('draft_footer_bg_color', e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* You can insert the Background Card here later */}
          </div>

          {/* Save / Preview / Publish Footer */}
          <footer className="p-4 border-t mt-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" /> All changes saved
                  </>
                )}
              </p>
              <Link href={`/store/${storeId}?preview=true`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
              </Link>
            </div>
            <Button onClick={handlePublish} disabled={isPublishing} className="w-full">
              {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Changes
            </Button>
          </footer>
        </ScrollArea>
      </aside>

      {/* Live Preview */}
      <main className="flex-1 bg-white">
        <iframe
          id="store-preview"
          src={`/store/${storeId}?preview=true`}
          className="w-full h-full border-0"
          title="Store Preview"
        />
      </main>
    </div>
  );
}
