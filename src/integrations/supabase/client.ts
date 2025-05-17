
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase project URL and anonymous key
// Use environment variables for configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://isjjzddntanbjopqylic.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzamp6ZGRudGFuYmpvcHF5bGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzEyMDAsImV4cCI6MjA2MDE0NzIwMH0._Y8ux53LbbT5aAVAyHJduvMGvHuBmKD34fU6xktyjR8";

// Get the current application URL for redirects
const getRedirectBase = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://doctor-page-builder-pro.lovable.app'; // Use the production URL as fallback
};

// Create a Supabase client for anonymous access
// This client will be used when users are not authenticated
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
    flowType: 'pkce', // More secure flow for browser-based auth
    detectSessionInUrl: true, // Important for handling redirect URLs
    redirectTo: `${getRedirectBase()}/auth` // Ensure email verification redirects to the auth page
  }
});

/**
 * Helper function for debugging auth issues
 * This will clear any existing Supabase auth state from local storage
 */
export const clearSupabaseAuthState = () => {
  try {
    // Remove any supabase-related items
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    console.log("Cleared Supabase auth state from local storage");
  } catch (error) {
    console.error("Error clearing Supabase auth state:", error);
  }
};
