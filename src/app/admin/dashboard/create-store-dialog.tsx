"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createStore } from '@/lib/stores';

interface CreateStoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} aria-label="Create store">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Store
    </Button>
  );
}

export function CreateStoreDialog({ isOpen, onClose }: CreateStoreDialogProps) {
  const initialState = { success: false, error: null, fieldErrors: {} };
  const [state, formAction] = useActionState(createStore, initialState);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!submittedRef.current) return;

    if (state.success) {
      toast.success("Store created successfully!");
      submittedRef.current = false; // reset after handling
      onClose();
    } else if (state.error) {
      toast.error("Failed to create store", {
        description: state.error,
      });
      submittedRef.current = false;
    }
  }, [state, onClose]);

  useEffect(() => {
    if (isOpen) {
      submittedRef.current = false;
    }
  }, [isOpen]);

  const handleSubmit = () => {
    submittedRef.current = true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-labelledby="dialog-title">
        <DialogHeader>
        <DialogTitle id="dialog-title">Create a New Store</DialogTitle>
          <DialogDescription id="dialog-description">
            Give your new store a name. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="space-y-4 py-2"
          aria-describedby="error-msg"
        >
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              name="storeName"
              placeholder="e.g., The Artisan's Nook"
              required
              aria-invalid={!!state.fieldErrors?.storeName}
              aria-describedby="error-msg"
            />
            {state.fieldErrors?.storeName && (
              <p id="error-msg" className="text-red-500 text-sm">
                {state.fieldErrors.storeName.join(', ')}
              </p>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              aria-label="Cancel creation"
            >
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
