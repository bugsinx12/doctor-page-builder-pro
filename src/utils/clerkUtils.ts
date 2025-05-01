
/**
 * Utility functions for working with Clerk authentication
 */

/**
 * Since we're using Clerk Third-Party Authentication (TPA) with Supabase,
 * we no longer need to convert Clerk IDs to UUIDs.
 * 
 * This function is kept for backwards compatibility with existing code
 * but simply returns the Clerk ID as-is, since with TPA we use the Clerk ID directly.
 * 
 * @param clerkId The Clerk user ID
 * @returns The Clerk ID (unchanged)
 */
export const getClerkId = (clerkId: string): string => {
  // With TPA, we simply use the Clerk ID directly
  return clerkId;
};
