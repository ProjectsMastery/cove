// src/lib/stores.ts
'use server';

import { createClient, createAdminClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Store } from '@/lib/types';

type CreateStoreState = {
    success: boolean;
    error?: string | null;
    fieldErrors?: z.ZodFlattenedError<z.infer<typeof storeSchema>>['fieldErrors'];
};
  

const storeSchema = z.object({
  storeName: z.string().min(2, "Store name is too short."),
});

/**
 * Fetches all stores owned by the currently authenticated admin/superadmin.
 */
/**
 * Fetches all stores owned by the currently authenticated admin/superadmin.
 */
export async function getStoresForAdmin(): Promise<{ success: boolean; data?: Store[]; error?: string }> {
    const supabase = createClient();
    
    // 1. Get the current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Not authenticated." };
    }

    // 2. Fetch all stores where the owner_id matches the user's ID
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

/**
 * A Server Action for a logged-in admin to create their own store.
 * Renamed to match the component's expectation.
 */
export async function createStore(prevState: CreateStoreState, formData: FormData): Promise<CreateStoreState> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in." };

    const validatedFields = storeSchema.safeParse({ storeName: formData.get('storeName') });
    
    // VVV THIS IS THE FIX VVV
    if (!validatedFields.success) {
        // We now return the detailed, flattened error object from Zod.
        return { 
            success: false, 
            error: "Invalid input. Please check the errors below.", // A more generic top-level error
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
    return { success: true };
}