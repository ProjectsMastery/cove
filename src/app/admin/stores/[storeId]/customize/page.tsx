//src/app/admin/stores/[storeid]/customize/page.tsx

"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, Eye, CheckCircle, Upload, X } from 'lucide-react';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { getThemeSettings, saveDraftTheme, publishTheme } from '@/lib/themes';
import type { ThemeSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDropzone } from 'react-dropzone';
import { getSignedUploadUrl } from '@/lib/upload'; // For logo uploads
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { useThemeStore } from '@/lib/store/themeStore'; // <-- Import our new store

export default function CustomizePage() {
  const { role, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const storeId = params.storeId as string;
  // VVV Get actions from our new Zustand store VVV
  const { setInitialTheme, updateTheme } = useThemeStore();

  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startSavingTransition] = useTransition();
  const [isPublishing, startPublishingTransition] = useTransition();

  // --- Live Preview Messaging ---
  const postThemeUpdate = (payload: any) => {
    const iframe = document.getElementById('store-preview') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.postMessage({ type: 'THEME_UPDATE', payload }, '*');
    }
  };

  // Load initial theme settings
  useEffect(() => {
    if (storeId) {
      getThemeSettings(storeId).then(result => {
        if (result.success && result.data) {
          setSettings(result.data);
           // VVV Set the initial state for the live preview VVV
           setInitialTheme(result.data);
        } 
        else toast.error("Failed to load theme settings", { description: result.error });
        setIsLoading(false);
      });
    }
  }, [storeId]);
  
  const debouncedSaveDraft = useDebouncedCallback(async (newSettings: ThemeSettings) => {
    startSavingTransition(async () => {
        // We construct a simple object with only the draft fields to save.
        const draftData = {
            draft_settings: newSettings.draft_settings,
            draft_logo_url: newSettings.draft_logo_url,
            draft_header_bg_color: newSettings.draft_header_bg_color,
            draft_footer_bg_color: newSettings.draft_footer_bg_color,
            draft_background: newSettings.draft_background,
        };
        const result = await saveDraftTheme(storeId, draftData);
        if (!result.success) {
            toast.error("Failed to save draft", { description: result.error });
        }
    });
  }, 1000); // 1-second debounce delay


  const handleSettingChange = (key: keyof ThemeSettings, value: any, nestedKey?: string) => {
    if (!settings) return;

    // Create a deep copy to avoid direct state mutation.
    const newSettings = JSON.parse(JSON.stringify(settings));

    if (nestedKey) {
        // This handles nested properties like draft_settings.primaryColor
        // It gracefully creates the parent object if it's null.
        if (!newSettings[key]) {
            (newSettings as any)[key] = {};
        }
        (newSettings[key] as any)[nestedKey] = value;
    } else {
        // This handles top-level properties like draft_header_bg_color
        (newSettings as any)[key] = value;
    }
    
    // 1. Optimistically update the local state for a responsive UI.
    setSettings(newSettings);

    // VVV THIS IS THE NEW, ROBUST WAY VVV
    // We update the Zustand store, which the iframe will react to.
    updateTheme(nestedKey ? { [nestedKey]: value } : { [key]: value });
    // debouncedSaveDraft(newSettings);
    
    // // 2. Send the specific change to the iframe for a live preview.
    // const payload = nestedKey ? { [nestedKey]: value } : { [key]: value };
    // postThemeUpdate(payload);
    
    // 3. Trigger the debounced save to the database.
    debouncedSaveDraft(newSettings);
  };

  const onLogoDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !settings) return;

    toast.info("Uploading logo...");
    try {
        const urlResult = await getSignedUploadUrl(file.name);
        if (!urlResult.success || !urlResult.path || !urlResult.token) {
            throw new Error(urlResult.error || "Could not get an upload URL.");
        }

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
            .from('product-images') // Or a new 'logos' bucket
            .uploadToSignedUrl(urlResult.path, urlResult.token, file);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(urlResult.path);
        
        const newSettings = { ...settings, draft_logo_url: publicUrl };

        // 1. Update local state.
        setSettings(newSettings);
        // // 2. Send message to iframe for live preview.
        // postThemeUpdate({ draft_logo_url: publicUrl }); 
        // // 3. Save to database.
        // debouncedSaveDraft(newSettings);
        
        // toast.success("Logo uploaded successfully.");

         // VVV UPDATE THE ZUSTAND STORE VVV
    updateTheme({ logoUrl: publicUrl });
    debouncedSaveDraft(newSettings);
    toast.success("Logo uploaded successfully.");

    } catch (error: any) {
        toast.error("Logo upload failed", { description: error.message });
    }
  }, [settings, debouncedSaveDraft, updateTheme]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop: onLogoDrop, accept: { 'image/*': [] }, multiple: false });

  const handlePublish = () => { /* ... (This is correct, no changes needed) ... */ };

  const userIsAdmin = role === 'admin' || role === 'superadmin';
  if (isAuthLoading || !userIsAdmin || isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex h-screen w-full bg-muted/40">
      <aside className="flex flex-col w-80 border-r bg-background">
        <header className="p-4 border-b">
          <Link href={`/admin/stores/${storeId}/dashboard`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h2 className="text-xl font-headline font-semibold text-white">Customize Theme</h2>
        </header>
        
        <ScrollArea className="flex-1 p-4 sticky top-0 overflow-y-auto">
          <div className="space-y-6">
            
            {/* --- BRANDING CARD (LOGO) --- */}
            <Card>
              <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Label>Logo</Label>
                <div {...getRootProps()} className="flex justify-center items-center w-full h-32 px-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                  <input {...getInputProps()} />
                  <div className="text-center">
                    {settings?.draft_logo_url ? (
                        <div className="relative h-20 w-40">
                            <Image src={settings.draft_logo_url} alt="Current Logo" fill className="object-contain" />
                        </div>
                    ) : (
                        <>
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Click or drag to upload</p>
                        </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* --- COLORS CARD --- */}
            <Card>
              <CardHeader><CardTitle>Colors</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input 
                    id="primaryColor" 
                    type="color" 
                    value={settings?.draft_settings.primaryColor || '#000000'}
                    onChange={(e) => handleSettingChange('draft_settings', e.target.value, 'primaryColor')}
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="headerBgColor">Header Background</Label>
                  <Input 
                    id="headerBgColor" 
                    type="color" 
                    value={settings?.draft_header_bg_color || '#FFFFFF'}
                    onChange={(e) => handleSettingChange('draft_header_bg_color', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* We will add the Background Card here in a future step */}

          </div>

          <footer className="p-4 border-t mt-auto">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {isSaving ? <><Loader2 className="h-4 w-4 animate-spin"/> Saving...</> : <><CheckCircle className="h-4 w-4 text-green-500"/> All changes saved</>}
                </p>
                <Link href={`/store/${storeId}`} target="_blank">
                    <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
                </Link>
            </div>
            <Button onClick={handlePublish} disabled={isPublishing} className="w-full">
                {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Changes
            </Button>
        </footer>
        </ScrollArea>
      </aside>

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