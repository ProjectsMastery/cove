// src/lib/upload.ts
"use server";

import { createAdminClient } from "./supabase/server";
// We need a secure way to check if the user is an admin.
// We can create a helper for this.
import { createClient } from "./supabase/server";

async function isUserAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    return profile?.role === 'admin' || profile?.role === 'superadmin';
}


/**
 * Securely uploads a product image using the Admin client to bypass RLS.
 * It first verifies that the calling user is a real admin.
 * @param formData The FormData object containing the file to upload.
 * @returns An object with success status and the public URL or an error message.
 */
export const uploadProductImage = async (formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> => {
  // 1. Security Check: Ensure the user making this request is a real admin.
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return { success: false, error: "Permission denied. You must be an admin to upload images." };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: "No file provided." };
  }

  const supabaseAdmin = createAdminClient();
  // Create a unique file path.
  const filePath = `product-image-${Date.now()}-${file.name.replace(/\s/g, '_')}`;

  // 2. Upload the file using the all-powerful admin client
  const { data: uploadData, error: uploadError } = await supabaseAdmin
    .storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Supabase admin upload error:", uploadError);
    return { success: false, error: uploadError.message };
  }

  // 3. Get the public URL. This is the corrected syntax.
  const { data } = supabaseAdmin
    .storage
    .from('product-images')
    .getPublicUrl(uploadData.path); // <-- No semicolon here

  return { success: true, url: data.publicUrl };
};
