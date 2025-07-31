// src/lib/stores.ts
'use server';

import { createClient, createAdminClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Store } from '@/lib/types';

type CreateStoreState = {
    success: boolean;
    error?: string | null;
}

const storeSchema = z.object({
  storeName: z.string().min(2, "Store name is too short."),
});

/**
 * Fetches all stores owned by the currently authenticated admin/superadmin.
 */
export async function getStoresForAdmin(): Promise<{ success: boolean; data?: Store[]; error?: string }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated." };

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
    if (!validatedFields.success) return { success: false, error: "Invalid store name." };
    
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