// src/lib/upload.ts
"use client"; // This function will be called from a client component

import { createClient } from "./supabase/client";
import { toast } from "sonner";

/**
 * Uploads a product image to the 'product-images' bucket in Supabase Storage.
 * @param file The image file to upload.
 * @returns The public URL of the uploaded image.
 * @throws An error if the upload fails.
 */
export const uploadProductImage = async (file: File): Promise<string> => {
  const supabase = createClient();
  
  // Create a unique file path for the image.
  // Example: 'product-image-1678886400000.jpg'
  const filePath = `product-image-${Date.now()}.${file.name.split('.').pop()}`;

  const { data, error } = await supabase
    .storage
    .from('product-images') // The name of the bucket we created
    .upload(filePath, file);

  if (error) {
    console.error("Supabase upload error:", error);
    toast.error("Image upload failed.", { description: error.message });
    throw new Error("Failed to upload image.");
  }

  // After a successful upload, we get the public URL for the image.
  // This is the URL we will store in our 'products' table.
  const { data: { publicUrl } } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicUrl;
};