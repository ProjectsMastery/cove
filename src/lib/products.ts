// src/lib/products.ts
'use server';

import { createAdminClient, createClient } from './supabase/server';
import type { Product, Category } from './types';
import { revalidatePath } from 'next/cache';

// --- Define the "contract" for our return types ---
type GetProductsResult = { success: true; data: Product[] } | { success: false; error: string };
type GetCategoriesResult = { success: true; data: Category[] } | { success: false; error: string };


// ===================================================================================
// DATA READING FUNCTIONS (PUBLIC FACING)
// ===================================================================================

// These functions are for the storefront. We can build RLS policies for them later
// to only show, for example, products that are "in stock".
export const getProducts = async (filters: { searchQuery?: string; categoryId?: string } = {}): Promise<GetProductsResult> => {
  const supabase = createClient(); // Use the public, anonymous client
  let query = supabase.from('products').select('*');

  if (filters.categoryId) query = query.eq('categoryId', filters.categoryId);
  if (filters.searchQuery) query = query.ilike('name', `%${filters.searchQuery}%`);

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as Product[] };
};

export const getCategories = async (): Promise<GetCategoriesResult> => {
  const supabase = createClient(); // Use the public, anonymous client
  const { data, error } = await supabase.from('categories').select('*');
  if (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as Category[] };
};


// ===================================================================================
// STORE-SPECIFIC DATA READING FUNCTIONS (FOR ADMINS)
// ===================================================================================

export const getProductsForStore = async (
  storeId: string,
  filters: { searchQuery?: string; categoryId?: string } = {} // <-- Add filters parameter
): Promise<{ success: true; data: Product[] } | { success: false; error: string }> => {
  if (!storeId) return { success: false, error: "Store ID is required." };
  
  const supabase = createClient(); // Use the standard client for public storefront
  
  let query = supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId);

  // VVV APPLY THE FILTERS VVV
  if (filters.categoryId) {
    query = query.eq('categoryId', filters.categoryId);
  }
  if (filters.searchQuery) {
    query = query.ilike('name', `%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching products for store ${storeId}:`, error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as Product[] };
};

export const getCategoriesForStore = async (storeId: string): Promise<GetCategoriesResult> => {
  if (!storeId) return { success: false, error: "Store ID is required." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId);

  if (error) {
    console.error(`Error fetching categories for store ${storeId}:`, error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as Category[] };
};


// ===================================================================================
// DATA WRITING FUNCTIONS (FOR ADMINS - MUST USE USER CONTEXT)
// ===================================================================================

export const addProduct = async (storeId: string, productData: Omit<Product, 'id' | 'created_at' | 'store_id'>) => {
    if (!storeId) throw new Error("Store ID is required to add a product.");
    // VVV THIS IS THE FIX VVV
    // Use the regular 'createClient()' which operates as the logged-in user.
    // This ensures RLS policies are correctly applied.
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, store_id: storeId }])
        .select();

    if (error) {
        console.error("Error adding product:", error);
        throw new Error(error.message); // Throw the real error from Supabase
    }

    revalidatePath(`/admin/stores/${storeId}/dashboard`);
    return data[0] as Product;
};

export const updateProduct = async (productId: string, storeId: string, productData: Partial<Omit<Product, 'id' | 'created_at'>>) => {
    const supabase = createClient();
    const { error } = await supabase.from('products').update(productData).eq('id', productId);
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/stores/${storeId}/dashboard`);
};

export const deleteProduct = async (productId: string, storeId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/stores/${storeId}/dashboard`);
};


export const addCategory = async (storeId: string, categoryData: Omit<Category, 'id' | 'created_at' | 'store_id'>) => {
    if (!storeId) throw new Error("Store ID is required to add a category.");
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('categories')
        .insert([{ ...categoryData, store_id: storeId }])
        .select();

    if (error) {
        console.error("Error adding category:", error);
        throw new Error(error.message);
    }
    revalidatePath(`/admin/stores/${storeId}/dashboard`);
    return data[0] as Category;
};

export const updateCategory = async (categoryId: string, storeId: string, categoryData: Partial<Omit<Category, 'id' | 'created_at'>>) => {
    const supabase = createClient();
    const { error } = await supabase.from('categories').update(categoryData).eq('id', categoryId);
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/stores/${storeId}/dashboard`);
};

export const deleteCategory = async (categoryId: string, storeId: string) => {
    const supabase = createClient();
    const { data: products, error: productError } = await supabase.from('products').select('id').eq('categoryId', categoryId).limit(1);
    if (productError) throw new Error("Could not verify category usage.");
    if (products && products.length > 0) throw new Error("Cannot delete category as it is currently in use by one or more products.");
    
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/stores/${storeId}/dashboard`);
};

/**
 * Deletes a store and all associated products and categories.
 * A user can only delete a store they own.
 * @param storeId The ID of the store to delete.
 */
export async function deleteStore(storeId: string): Promise<{ success: boolean; error?: string }> {
  if (!storeId) return { success: false, error: "Store ID is required." };

  const supabase = createClient(); // Use the user's context to verify ownership
  const supabaseAdmin = createAdminClient(); // Use the admin client for cascading deletes

  // 1. Verify the user owns this store before proceeding.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required." };

  const { data: store, error: ownerError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .single();

  if (ownerError || !store) return { success: false, error: "Store not found." };
  if (store.owner_id !== user.id) return { success: false, error: "You do not have permission to delete this store." };


  // 2. Perform the cascading delete using the Admin client.
  //    This is a "transaction" - if one part fails, the whole thing fails.
  try {
    // We don't need to delete products/categories manually if the foreign key is set to "CASCADE"
    // But doing it manually is safer if the cascade setting is missed.
    await supabaseAdmin.from('products').delete().eq('store_id', storeId);
    await supabaseAdmin.from('categories').delete().eq('store_id', storeId);
    
    // Finally, delete the store itself.
    const { error: deleteError } = await supabaseAdmin.from('stores').delete().eq('id', storeId);
    if (deleteError) throw deleteError;

  } catch (error: any) {
    console.error("Error during store deletion:", error);
    return { success: false, error: "A database error occurred while trying to delete the store." };
  }

  // 3. Revalidate paths and return success.
  revalidatePath('/admin/dashboard');
  return { success: true };
}