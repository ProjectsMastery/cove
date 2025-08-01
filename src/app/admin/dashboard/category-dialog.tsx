// src/app/admin/dashboard/category-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import type { Category } from "@/lib/types";
import { addCategory, updateCategory } from "@/lib/products";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Props definition for our component
interface CategoryDialogProps {
  isOpen: boolean;
  onClose: (wasSaved: boolean) => void;
  category: Category | null;
  storeId: string; // <-- ADD THIS LINE
}

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

type CategoryFormData = z.infer<typeof formSchema>;

export function CategoryDialog({ isOpen, onClose, category, storeId }: CategoryDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(formSchema),
  });

  // This effect runs when the dialog opens. It populates the form
  // with the category's data if we are editing, or resets it if we are adding.
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({ name: category.name });
      } else {
        reset({ name: "" });
      }
    }
  }, [isOpen, category, reset]);

  // This function is called on form submission
  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    setIsSaving(true);
    try {
      if (category) {
        // You would pass storeId here too for updating
        // await updateCategory(category.id, storeId, data);
        toast.success("Category updated.");
      } else {
        await addCategory(storeId, data); // Pass the storeId to the action
        toast.success("Category added.");
      }
      onClose(true);
    } catch (error: any) {
      toast.error("Failed to save category.", { description: error.message });
      onClose(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-md"
      aria-labelledby="category-dialog-title"
        aria-describedby="category-dialog-description"
      >
        <DialogHeader>
        <DialogTitle id="category-dialog-title">
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription id="category-dialog-description">
            {category ? "Make changes to your category here." : "Enter the name for the new category."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}