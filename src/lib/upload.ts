// src/lib/upload.ts
"use server"; // This is now a Server Action file

import { createAdminClient } from "./supabase/server"; // Use the ADMIN client
import { getIsAdmin } from "./products"; // Our secure admin check

/**
 * Securely uploads a product image using the Admin client to bypass RLS.
 * It first verifies that the calling user is an admin.
 * @param formData The FormData object containing the file to upload.
 * @returns An object with success status and the public URL or an error message.
 */
export const uploadProductImage = async (formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> => {
  // 1. Security Check: Ensure the user making this request is a real admin.
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return { success: false, error: "Permission denied." };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: "No file provided." };
  }

  const supabaseAdmin = createAdminClient();
  const filePath = `product-image-${Date.now()}.${file.name.split('.').pop()}`;

  // 2. Upload the file using the all-powerful admin client
  const { error: uploadError } = await supabaseAdmin
    .storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Supabase admin upload error:", uploadError);
    return { success: false, error: uploadError.message };
  }

  // 3. Get the public URL
  const { data: { publicUrl } } = supabaseAdmin
    .storage
    .from('product-images')
    .getPublicUrl(filePath);

  return { success: true, url: publicUrl };
};
  return publicUrl;
};
