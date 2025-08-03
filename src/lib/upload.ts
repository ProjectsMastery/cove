// src/lib/upload.ts
"use server";

import { createAdminClient } from "./supabase/server";
import { createClient } from "./supabase/server";

// Helper to securely check the user's role on the server.
async function isUserAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    return profile?.role === 'admin' || profile?.role === 'superadmin';
}

/**
 * Creates a secure, signed URL for uploading a file directly to Supabase Storage.
 * This is a secure way to bypass Next.js Server Action body limits.
 * @param fileName The name of the file to be uploaded.
 * @returns An object with success status and the necessary upload details or an error.
 */
export const getSignedUploadUrl = async (fileName: string): Promise<{ success: boolean; error?: string; path?: string; token?: string; signedURL?: string; }> => {
  // 1. Security Check
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return { success: false, error: "Permission denied." };
  }
  
  const supabaseAdmin = createAdminClient();
  const filePath = `product-image-${Date.now()}-${fileName.replace(/\s/g, '_')}`;

  // 2. Ask Supabase to create a secure, time-limited upload URL.
  const { data, error } = await supabaseAdmin
    .storage
    .from('product-images')
    .createSignedUploadUrl(filePath); // URL is valid for 60 seconds

  if (error) {
    console.error("Error creating signed upload URL:", error);
    return { success: false, error: error.message };
  }

  // 3. Return the URL and necessary parts to the client.
  return { success: true, ...data };
};
