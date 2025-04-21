
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert Clerk ID to a valid UUID for Supabase
const getUUIDFromClerkID = (clerkId: string): string => {
  // Check if the ID is already a valid UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(clerkId)) {
    console.log("Clerk ID is already a valid UUID:", clerkId);
    return clerkId;
  }

  // If not a valid UUID, generate a deterministic UUID based on the Clerk ID
  let hash = 0;
  for (let i = 0; i < clerkId.length; i++) {
    const char = clerkId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Correct: create a Uint8Array for the uuidv4 random param
  const seed = new Uint8Array(16);
  const absHash = Math.abs(hash);
  for (let i = 0; i < 16; i++) {
    seed[i] = (absHash >> ((i % 4) * 8)) & 0xff;
  }

  const generatedUuid = uuidv4({ random: seed });
  console.log("Generated UUID for Clerk ID:", clerkId, "->", generatedUuid);
  return generatedUuid;
};

export default getUUIDFromClerkID;
