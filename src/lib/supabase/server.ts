// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This function creates a Supabase client for Server Components, Server Actions, and Route Handlers.
export function createClient() {
  // We pass the cookies() function directly to the handlers,
  // allowing them to be called within their async context.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // The cookie handlers must now be async to support `await`.
        async getAll() {
          // Await the cookies() function to get the actual store.
          return (await cookies()).getAll()
        },
        async setAll(cookiesToSet) {
          try {
            // Await the cookies() function to get a writable store.
            const cookieStore = await cookies()
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

// This function for the admin client also needs to be updated to satisfy the types.
export function createAdminClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
              // Provide empty async methods to match the new required signature.
              async getAll() {
                return []
              },
              async setAll() {
                // No-op
              },
            },
            auth: {
              persistSession: false
            }
        }
    )
}