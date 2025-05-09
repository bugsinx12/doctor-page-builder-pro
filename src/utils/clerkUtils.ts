
/**
 * Utility functions for working with Clerk authentication
 */

/**
 * Since we're using Clerk Third-Party Authentication (TPA) with Supabase,
 * we directly use the Clerk ID as the user identifier in our database tables.
 * 
 * This function is maintained for backwards compatibility but simply returns the Clerk ID.
 * 
 * @param clerkId The Clerk user ID
 * @returns The Clerk ID (unchanged)
 */
export const getClerkId = (clerkId: string): string => {
  return clerkId;
};

/**
 * Clean up any local storage items related to authentication
 * This is useful when signing out or debugging auth issues
 */
export const cleanupAuthState = () => {
  // Remove any clerk-related items
  Object.keys(localStorage).forEach(key => {
    if (key.includes('clerk') || key.includes('__clerk')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove any supabase-related items
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Helper to perform a full sign out, clearing all auth state
 * @param signOut The signOut function from Clerk's useAuth hook
 * @param callback Optional callback to run after signing out
 */
export const performFullSignOut = async (
  signOut: () => Promise<void>, 
  callback?: () => void
) => {
  try {
    // First clean up any auth items in local storage
    cleanupAuthState();
    
    // Then perform the sign out through Clerk
    await signOut();
    
    // Run the callback if provided
    if (callback) {
      callback();
    }
    
    // Force a full page reload to ensure clean state
    window.location.href = '/auth';
  } catch (error) {
    console.error('Error during sign out:', error);
    // Still redirect to auth page even if there was an error
    window.location.href = '/auth';
  }
};
