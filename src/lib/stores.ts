// src/lib/stores.ts
'use server';

import { createClient, createAdminClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Store } from '@/lib/types';

const storeSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters."),
});

// This is the correct, complete state type
type CreateStoreState = {
    success: boolean;
    error?: string | null;
    fieldErrors?: z.ZodFlattenedError<z.infer<typeof storeSchema>>['fieldErrors'] | null;
};
  
export async function getStoresForAdmin(): Promise<{ success: boolean; data?: Store[]; error?: string }> {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Not authenticated." };
    }

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id);

    if (error) {
        console.error("Error fetching stores:", error);
        return { success: false, error: error.message };
    }
    return { success: true, data: data as Store[] };
}

export async function createStore(prevState: CreateStoreState, formData: FormData): Promise<CreateStoreState> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in." };

    const validatedFields = storeSchema.safeParse({ storeName: formData.get('storeName') });
    
    if (!validatedFields.success) {
        return { 
            success: false, 
            error: "Invalid input. Please check the errors below.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { storeName } = validatedFields.data;

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
        .from('stores')
        .insert({ name: storeName, owner_id: user.id });

    if (error) {
        console.error("Store creation error:", error);
        return { success: false, error: "Database error: Could not create store." };
    }
    
    revalidatePath('/admin/dashboard');
    // VVV THIS IS THE FIX VVV
    // The success case must also return the full state object.
    return { success: true, error: null, fieldErrors: null };
}
