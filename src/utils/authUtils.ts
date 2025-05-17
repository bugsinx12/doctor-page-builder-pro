
/**
 * Utility functions for working with Supabase authentication
 */

/**
 * Clean up any local storage items related to authentication
 * This is useful when signing out or debugging auth issues
 */
export const cleanupAuthState = () => {
  try {
    // Remove any supabase-related items
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    console.log("Cleared Supabase auth state from local storage");
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
};

/**
 * Helper to perform a full sign out, clearing all auth state
 * @param signOut The signOut function from AuthContext
 * @param callback Optional callback to run after signing out
 */
export const performFullSignOut = async (
  signOut: () => Promise<void>, 
  callback?: () => void
) => {
  try {
    // First clean up any auth items in local storage
    cleanupAuthState();
    
    // Then perform the sign out through Supabase
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

/**
 * Helper to get a profile image from an email using Gravatar
 * @param email The user's email address
 * @returns A URL for the user's Gravatar image
 */
export const getGravatarUrl = (email?: string): string => {
  if (!email) return '';
  
  // Create an MD5 hash of the email (simplified version)
  const hash = btoa(email.toLowerCase().trim()).replace(/[^a-z0-9]/g, '');
  
  // Return the Gravatar URL
  return `https://www.gravatar.com/avatar/${hash}?d=mp`;
};
