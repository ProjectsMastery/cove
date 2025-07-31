// src/lib/products.ts
'use server';

import { createAdminClient, createClient } from './supabase/server';
import type { Product, Category } from './types';
import { revalidatePath } from 'next/cache';

// --- Define the "contract" for our return types ---
type GetProductsResult = { success: true; data: Product[] } | { success: false; error: string };
type GetCategoriesResult = { success: true; data: Category[] } | { success: false; error: string };


// ===================================================================================
// DATA READING FUNCTIONS
// ===================================================================================
export const getProducts = async (filters: { searchQuery?: string; categoryId?: string } = {}): Promise<GetProductsResult> => {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('categories').select('*');
  if (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as Category[] };
};


// ===================================================================================
// DATA WRITING FUNCTIONS (FOR ADMINS)
// ===================================================================================
async function getAdminStoreId() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");

    const { data: profile } = await supabase.from('profiles').select('store_id').eq('id', user.id).single();
    if (!profile || !profile.store_id) throw new Error("Admin profile or store not found.");
    
    return profile.store_id;
}

export const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    const supabase = createAdminClient();
    const store_id = await getAdminStoreId();
    const { data, error } = await supabase.from('products').insert([{ ...productData, store_id }]).select();
    if (error) throw new Error("Failed to add product.");
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return data[0] as Product;
};

export const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'created_at'>>) => {
    const supabase = createAdminClient();
    const { error } = await supabase.from('products').update(productData).eq('id', productId);
    if (error) throw new Error("Failed to update product.");
    revalidatePath('/admin/dashboard');
    revalidatePath(`/products/${productId}`);
};

export const deleteProduct = async (productId: string) => {
    const supabase = createAdminClient();
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error("Failed to delete product.");
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
};

export const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    const supabase = createAdminClient();
    const store_id = await getAdminStoreId();
    const { data, error } = await supabase.from('categories').insert([{ ...categoryData, store_id }]).select();
    if (error) throw new Error("Failed to add category.");
    revalidatePath('/admin/dashboard');
    return data[0] as Category;
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'created_at'>>) => {
    const supabase = createAdminClient();
    const { error } = await supabase.from('categories').update(categoryData).eq('id', categoryId);
    if (error) throw new Error("Failed to update category.");
    revalidatePath('/admin/dashboard');
};

export const deleteCategory = async (categoryId: string) => {
    const supabase = createAdminClient();
    const { data: products, error: productError } = await supabase.from('products').select('id').eq('categoryId', categoryId).limit(1);
    if (productError) throw new Error("Could not verify category usage.");
    if (products && products.length > 0) throw new Error("Cannot delete category as it is currently in use by one or more products.");
    
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) throw new Error("Failed to delete category.");
    revalidatePath('/admin/dashboard');
};


// ===================================================================================
// STORE-SPECIFIC DATA READING FUNCTIONS
// ===================================================================================

/**
 * Fetches all products that belong to a specific store.
 * @param storeId The UUID of the store.
 */
export const getProductsForStore = async (storeId: string): Promise<{ success: true; data: Product[] } | { success: false; error: string }> => {
  if (!storeId) return { success: false, error: "Store ID is required." };
  
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId); // <-- The crucial filter

  if (error) {
    console.error(`Error fetching products for store ${storeId}:`, error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as Product[] };
};

/**
 * Fetches all categories that belong to a specific store.
 * @param storeId The UUID of the store.
 */
export const getCategoriesForStore = async (storeId: string): Promise<{ success: true; data: Category[] } | { success: false; error: string }> => {
  if (!storeId) return { success: false, error: "Store ID is required." };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId); // <-- The crucial filter

  if (error) {
    console.error(`Error fetching categories for store ${storeId}:`, error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as Category[] };
};