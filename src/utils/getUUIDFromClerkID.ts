
import { v5 as uuidv5 } from 'uuid';

// Helper function to convert Clerk ID to a valid UUID for Supabase
// Using UUID v5 with a namespace for more deterministic results
const getUUIDFromClerkID = (clerkId: string | null | undefined): string | null => {
  if (!clerkId) {
    console.log("No Clerk ID provided");
    return null;
  }

  // Check if the ID is already a valid UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(clerkId)) {
    console.log("Clerk ID is already a valid UUID:", clerkId);
    return clerkId;
  }

  // Create a namespace based on the application name - this should remain constant
  const NAMESPACE = "d6d51b5a-34c4-4a0d-8c2f-3bd278c80080"; // Static UUID for our app

  // Generate a deterministic UUID based on the Clerk ID using the namespace
  const generatedUuid = uuidv5(clerkId, NAMESPACE);
  
  console.log("Generated UUID for Clerk ID:", clerkId, "->", generatedUuid);
  return generatedUuid;
};

export default getUUIDFromClerkID;
