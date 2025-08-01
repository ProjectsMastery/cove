// src/lib/image-optimizer.ts
"use client";

import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

const options = {
  maxSizeMB: 1,      // Target size
  maxWidthOrHeight: 1920, // Max dimensions
  useWebWorker: true,
};

/**
 * Compresses an image file in the browser before uploading.
 * @param file The original image file from the user.
 * @returns The compressed image file, or null if an error occurs.
 */
export async function compressImage(file: File): Promise<File | null> {
  // Check if the file is already small enough to skip compression.
  if (file.size / 1024 / 1024 < options.maxSizeMB) {
    return file;
  }

  try {
    toast.info("Optimizing image...", { 
      description: "Your image is being compressed for faster uploads." 
    });
    
    const compressedFile = await imageCompression(file, options);
    
    console.log(`Image compressed successfully: ${
        (file.size / 1024 / 1024).toFixed(2)
    } MB -> ${
        (compressedFile.size / 1024 / 1024).toFixed(2)
    } MB`);
    
    return compressedFile;
  } catch (error) {
    console.error("Image compression error:", error);
    toast.error("Image optimization failed.", { 
      description: "Could not process the image. Please try a different file." 
    });
    return null;
  }
} // <-- The stray brace was here. It has been removed.
