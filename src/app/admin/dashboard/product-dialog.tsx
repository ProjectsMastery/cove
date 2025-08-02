// src/app/admin/dashboard/product-dialog.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Category } from "@/lib/types";
import { addProduct, updateProduct } from "@/lib/products";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { ScrollArea } from "@/components/ui/scroll-area";
import { compressImage } from '@/lib/image-optimizer'; // <-- Import our new function
import { getSignedUploadUrl } from "@/lib/upload";



interface ProductDialogProps {
  isOpen: boolean;
  onClose: (wasSaved: boolean) => void;
  product: Product | null;
  categories: Category[];
  storeId: string; // <-- ADD THIS LINE
}

// --- VVV THIS IS THE NEW, ROBUST SCHEMA DEFINITION VVV ---
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  // The INPUT can be a string or a number, but the OUTPUT will be a number.
  price: z.coerce.number().positive("Price must be a positive number."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  categoryId: z.string().min(1, "Please select a category."),
});

// We explicitly define the OUTPUT type from the schema.
type ProductFormData = z.infer<typeof formSchema>;
type ProductFormOutput = z.output<typeof formSchema>;


export function ProductDialog({ isOpen, onClose, product,  storeId, categories }: ProductDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [newlyAddedFiles, setNewlyAddedFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormOutput>({ // We still use the OUTPUT type here
    // But the resolver now understands the coercion and won't throw an error.
    resolver: zodResolver(formSchema) as Resolver<ProductFormOutput, any, ProductFormOutput>, 
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => { setNewlyAddedFiles(prev => [...prev, ...acceptedFiles]); }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });
  const previewUrls = [...existingImageUrls, ...newlyAddedFiles.map(file => URL.createObjectURL(file))];

  useEffect(() => {
    if (isOpen) {
      if (product) {
        // The reset object is now clean and correct.
        const formValues: ProductFormData = {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
        };
        reset(formValues);
        setExistingImageUrls(product.imageUrls || []);
      } else {
        reset({ name: "", description: "", price: 0, stock: 0, categoryId: "" });
        setExistingImageUrls([]);
      }
      setNewlyAddedFiles([]);
    }
  }, [isOpen, product, reset]);
  
  const removeImage = (index: number) => {
    if (index < existingImageUrls.length) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImageUrls.length;
      setNewlyAddedFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const onSubmit: SubmitHandler<ProductFormOutput> = async (data) => {
    setIsSaving(true);
    try {
      let finalImageUrls = [...existingImageUrls];
      
      if (newlyAddedFiles.length > 0) {
        toast.info("Uploading images...", { description: "This may take a moment." });

        // VVV THIS IS THE NEW DIRECT UPLOAD LOGIC VVV
        const uploadPromises = newlyAddedFiles.map(async (file) => {
          // 1. Ask our server for a secure place to upload.
          const urlResult = await getSignedUploadUrl(file.name);
          if (!urlResult.success) {
            throw new Error(urlResult.error || "Could not get an upload URL.");
          }

          // 2. Upload the file DIRECTLY to Supabase Storage using the secure URL.
          const { error: uploadError } = await createClient() // Use the normal client
            .storage
            .from('product-images')
            .uploadToSignedUrl(urlResult.path!, urlResult.token!, file, {
                upsert: false // Don't overwrite existing files
            });

          if (uploadError) {
            throw new Error(uploadError.message || `Upload failed for ${file.name}.`);
          }

          // 3. Get the final public URL of the uploaded file.
          const { data: { publicUrl } } = createClient().storage.from('product-images').getPublicUrl(urlResult.path!);
          return publicUrl;
        });
        
        const newUrls = await Promise.all(uploadPromises);
        finalImageUrls = [...finalImageUrls, ...newUrls];
      }

      if (finalImageUrls.length === 0) {
        toast.error("Validation Error", { description: "Product must have at least one image." });
        setIsSaving(false);
        return;
      }

      const finalData = { ...data, imageUrls: finalImageUrls };

      if (product) {
        await updateProduct(product.id, storeId, finalData);
        toast.success("Product updated successfully.");
      } else {
        await addProduct(storeId, finalData as Omit<Product, 'id' | 'created_at' | 'store_id'>);
        toast.success("Product added successfully.");
      }
      onClose(true);
    } catch (error: any) {
      console.error("Failed to save product:", error);
      toast.error("Failed to save product.", { description: error.message });
      onClose(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-2xl" 
        aria-labelledby="product-dialog-title"
        aria-describedby="product-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="product-dialog-title">{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription id="product-dialog-description">
            Fill in the details for the product. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* The rest of your JSX form remains exactly the same */}
            <div>
              <Label>Images</Label>
              <div {...getRootProps()} className={`mt-2 flex justify-center items-center w-full h-32 px-6 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-input'}`}>
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">{isDragActive ? "Drop the files here ..." : "Drag 'n' drop files here, or click to select"}</p>
                </div>
              </div>
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image src={url} alt={`Preview ${index}`} width={100} height={100} className="rounded-md object-cover aspect-square" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} />
                {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" step="0.01" {...register("price")} />
                  {errors.price && <p className="text-destructive text-sm mt-1">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" {...register("stock")} />
                  {errors.stock && <p className="text-destructive text-sm mt-1">{errors.stock.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                 <Select onValueChange={(value) => setValue('categoryId', value)} value={watch('categoryId')}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                          {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                {errors.categoryId && <p className="text-destructive text-sm mt-1">{errors.categoryId.message}</p>}
            </div>

            <DialogFooter className="pt-4 !mt-8">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
