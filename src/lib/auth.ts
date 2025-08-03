// Located in: src/lib/auth.ts
'use server';

import { createAdminClient } from './supabase/server';
import { z } from 'zod';

// Zod schema for input validation.
const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, "Password must be at least 6 characters."),
  storeName: z.string().min(2, "Store name must be at least 2 characters."),
});

// The shape of the state object that the useActionState hook will manage.
type RegisterAdminState = {
    success: boolean;
    error?: string | null;
    fieldErrors?: z.ZodFlattenedError<z.infer<typeof registerSchema>>['fieldErrors'];
};

/**
 * A secure Server Action to register a new admin (store owner) and create their first store.
 * This function is designed to be used with React's useActionState hook.
 */
export async function registerAdminAndCreateStore(
    prevState: RegisterAdminState,
    formData: FormData
): Promise<RegisterAdminState> {
  const supabaseAdmin = createAdminClient();

  // 1. Validate the form input using the Zod schema.
  const validatedFields = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    storeName: formData.get('storeName'),
  });

  if (!validatedFields.success) {
    return { 
        success: false, 
        error: "Invalid input. Please check the errors below.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, storeName } = validatedFields.data;

  // 2. Create the new user in Supabase Auth.
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
  
  // 3. Set the new user's role to 'admin' in their profile.
  // The database trigger has already created their profile row with the default 'user' role.
  // We are now updating that row. The profile is NOT linked to a specific store.
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', newUserId);
  
  if (profileError) {
    // If we can't set their role, we should clean up and delete the user.
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    console.error("Profile update error:", profileError);
    return { success: false, error: "Could not set the admin role for the new user." };
  }

  // 4. Create the admin's first store, owned by the new user.
  const { error: storeError } = await supabaseAdmin
    .from('stores')
    .insert({ name: storeName, owner_id: newUserId });

  if (storeError) {
    // If store creation fails, the user still exists as an admin without a store.
    // This is a valid state in our new architecture. They can try to create a store again later.
    console.error("Store creation error:", storeError);
    return { success: false, error: "Admin account was created, but the first store could not be." };
  }

  // 5. If everything succeeded, return a success state.
  return { success: true };
}