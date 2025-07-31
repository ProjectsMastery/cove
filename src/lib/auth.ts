// src/lib/auth.ts
'use server';

import { createAdminClient } from './supabase/server';
import { z } from 'zod';

// Zod schema remains the same
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters."),
  storeName: z.string().min(2, "Store name must be at least 2 characters."),
});

// Define the shape of the state object that useFormState will manage
type RegisterAdminState = {
    success: boolean;
    error?: string | null;
    details?: z.ZodFlattenedError<z.infer<typeof registerSchema>> | null;
}

/**
 * A secure Server Action to register a new admin (store owner) and create their first store.
 * Updated to match the signature required by React's useFormState hook.
 */
export async function registerAdminAndCreateStore(
    prevState: RegisterAdminState, // <-- THE FIX: Add the prevState argument
    formData: FormData
): Promise<RegisterAdminState> { // <-- Return the same state type
  const supabaseAdmin = createAdminClient();

  // 1. Validate the form input
  const validatedFields = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    storeName: formData.get('storeName'),
  });

  if (!validatedFields.success) {
    return { success: false, error: "Invalid form data.", details: validatedFields.error.flatten() };
  }

  const { email, password, storeName } = validatedFields.data;

  // 2. Create the new user in Supabase Auth
  const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  if (authError) {
    console.error("Auth creation error:", authError);
    return { success: false, error: authError.message };
  }
  const newUserId = userData.user.id;

  // 3. Create the store
  const { data: storeData, error: storeError } = await supabaseAdmin
    .from('stores')
    .insert({ name: storeName, owner_id: newUserId })
    .select('id')
    .single();

  if (storeError) {
    console.error("Store creation error:", storeError);
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return { success: false, error: "Could not create the store." };
  }
  const newStoreId = storeData.id;

  // 4. Update the user's profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ store_id: newStoreId, role: 'admin' })
    .eq('id', newUserId);
  
  if (profileError) {
    console.error("Profile update error:", profileError);
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    await supabaseAdmin.from('stores').delete().eq('id', newStoreId);
    return { success: false, error: "Could not assign store to the new admin profile." };
  }

  // 5. Success
  return { success: true };
}