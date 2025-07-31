// src/lib/types.ts

// This type represents the structure of a single product,
// matching the columns in our 'products' table in Supabase.
export type Product = {
    id: string; // uuid from Supabase
    created_at: string; // timestamptz from Supabase, will be an ISO string
    name: string;
    description: string;
    price: number;
    imageUrls: string[]; // jsonb from Supabase, will be an array of strings
    stock: number;
    categoryId: string; // uuid from Supabase, foreign key
  };

  export type Store = {
    id: string; // uuid
    created_at: string; // timestamptz
    name: string;
    owner_id: string; // uuid
    custom_domain: string | null;
  };
  
  // This type represents a single category.
  export type Category = {
    id: string; // uuid
    created_at: string; // timestamptz
    name: string;
  };
  
  // This type represents an item in the user's shopping cart.
  // It's a combination of a Product and the quantity they want.
  export type CartItem = {
    product: Product;
    quantity: number;
  };
  
  // This type represents a customer's order.
  export type Order = {
    id: string; // uuid
    created_at: string; // timestamptz
    userId: string; // uuid of the user who placed the order
    items: CartItem[]; // jsonb
    total: number;
    shippingAddress: { // jsonb
      name: string;
      address: string;
      city: string;
      country: string;
    };
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'; // text
  };
  
  // This type represents a user's public profile,
  // matching the 'profiles' table we created.
  export type Profile = {
    id: string; // uuid, matches auth.users.id
    email: string;
    role: 'user' | 'admin' | 'superadmin';
    store_id: string | null; // Add store_id to the type
  };