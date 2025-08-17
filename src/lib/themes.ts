// src/lib/themes.ts
'use server';

import { createClient, createAdminClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import type { ThemeSettings } from './types';

const DEFAULT_THEME_SETTINGS = {
    primaryColor: "#6D28D9",
    fontFamily: "Inter",
    layoutStyle: "Grid"
};

// In src/lib/themes.ts

/**
 * Fetches theme settings for a store. If they don't exist, it creates them.
 */
// VVV THIS IS THE FIX: We remove the unused second argument. VVV
export async function getThemeSettings(storeId: string): Promise<{ success: boolean; data?: ThemeSettings; error?: string }> {
  if (!storeId) return { success: false, error: "Store ID is required." };
  
  const supabase = createClient();
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabase
    .from('theme_settings')
    .select('*')
    .eq('store_id', storeId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching theme settings:", error);
    return { success: false, error: error.message };
  }
  
  if (data) {
    return { success: true, data: data as ThemeSettings };
  }

  // If no settings were found, create them now.
  try {
    const { data: newData, error: insertError } = await supabaseAdmin
        .from('theme_settings')
        .insert({
            store_id: storeId,
            published_settings: DEFAULT_THEME_SETTINGS,
            draft_settings: DEFAULT_THEME_SETTINGS,
        })
        .select()
        .single();
    
    if (insertError) throw insertError;

    return { success: true, data: newData as ThemeSettings };
  } catch (createError: any) {
    console.error("Error creating default theme settings:", createError);
    return { success: false, error: "Could not create theme settings for this store." };
  }
}

/**
 * Saves the DRAFT theme settings for a store.
 */
export async function saveDraftTheme(storeId: string, draftSettings: any): Promise<{ success: boolean; error?: string }> {
  if (!storeId) return { success: false, error: "Store ID is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from('theme_settings')
    .update({ draft_settings: draftSettings, updated_at: new Date().toISOString() })
    .eq('store_id', storeId);

  if (error) {
    console.error("Error saving draft theme:", error);
    return { success: false, error: error.message };
  }

  // We revalidate the customize page to ensure the preview updates.
  revalidatePath(`/admin/stores/${storeId}/customize`);
  return { success: true };
}

/**
 * Publishes the draft theme, making it live.
 * This copies the contents of draft_settings to published_settings.
 */
export async function publishTheme(storeId: string): Promise<{ success: boolean; error?: string }> {
  if (!storeId) return { success: false, error: "Store ID is required." };
  
  const supabase = createClient();
  // First, get the current draft settings.
  const { data, error: fetchError } = await supabase
    .from('theme_settings')
    .select('draft_settings')
    .eq('store_id', storeId)
    .single();
  
  if (fetchError || !data) return { success: false, error: "Could not fetch draft settings to publish." };

  // Now, update the published_settings with the draft content.
  const { error: publishError } = await supabase
    .from('theme_settings')
    .update({ published_settings: data.draft_settings, updated_at: new Date().toISOString() })
    .eq('store_id', storeId);

  if (publishError) {
    console.error("Error publishing theme:", publishError);
    return { success: false, error: publishError.message };
  }
  
  // Revalidate both the storefront and the customizer
  revalidatePath(`/${storeId}`);
  revalidatePath(`/admin/stores/${storeId}/customize`);
  return { success: true };
}