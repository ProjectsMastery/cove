// src/lib/image-optimizer.ts
"use client";

import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

// --- Configuration for our image compression ---
const options = {
  maxSizeMB: 1,      // We will try to compress the image to be under 1 MB.
  maxWidthOrHeight: 1920, // Resize the image to a max of 1920px on its longest side.
  useWebWorker: true,  // Use a web worker to avoid freezing the UI during compression.
};

/**
 * Compresses an image file in the browser before uploading.
 * @param file The original image file from the user.
 * @returns The compressed image file, or null if an error occurs.
 */
export async function compressImage(file: File): Promise<File | null> {
  // Check if the file is already small enough.
  if (file.size / 1024 / 1024 < options.maxSizeMB) {
    return file; // If it's already small, no need to compress.
  }

  try {
    toast.info("Optimizing image...", { description: "Your image is being compressed for faster uploads." });
    
    const compressedFile = await imageCompression(file, options);
    
    console.log(`Image compressed successfully: ${
        (file.size / 1024 / 1024).toFixed(2)
    } MB -> ${
        (compressedFile.size / 1024 / 1024).toFixed(2)
    } MB`);
    
    return compressedFile;
  } catch (error) {
    console.error("Image compression error:", error);
    toast.error("Image optimization failed.", { description: "Could not compress the image. Please try a different file." });
    return null;
  }
}                                                                            } catch (error) {
                                                                                console.error("Image compression error:", error);
                                                                                    toast.error("Image optimization failed.", { description: "Could not compress the image. Please try a different file." });
                                                                                        return null;
                                                                                          }
                                                                                          }
