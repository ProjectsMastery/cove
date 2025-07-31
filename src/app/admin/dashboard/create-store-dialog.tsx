// src/app/admin/dashboard/create-store-dialog.tsx
"use client";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createStore } from '@/lib/stores';

// Props definition for our component
interface CreateStoreDialogProps {
  isOpen: boolean;
  onClose: () => void; // A simple callback to close the dialog
}

function SubmitButton() {
  const { pending } from useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Store
    </Button>
  );
}

export function CreateStoreDialog({ isOpen, onClose }: CreateStoreDialogProps) {
  // useActionState handles the form submission and state updates
  const [state, formAction] = useActionState(createStore, { success: false, error: null });

  // This effect listens for the result from the server action
  useEffect(() => {
    if (state.success) {
      toast.success("Store created successfully!");
      onClose(); // Close the dialog
      // No need to reload, revalidatePath in the server action will trigger a data refresh.
    } else if (state.error) {
      toast.error("Failed to create store", {
        description: state.error,
      });
    }
  }, [state, onClose]);
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Store</DialogTitle>
          <DialogDescription>
            Give your new store a name. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                    id="storeName"
                    name="storeName"
                    placeholder="e.g., The Artisan's Nook"
                    required
                />
            </div>
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}