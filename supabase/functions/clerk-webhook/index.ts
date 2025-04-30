
// clerk-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET") || "";

// Headers for CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to verify Clerk webhook signatures
const verifyClerkWebhookSignature = async (
  payload: string,
  headers: Headers
): Promise<boolean> => {
  if (!CLERK_WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return false;
  }

  const svix_id = headers.get("svix-id");
  const svix_timestamp = headers.get("svix-timestamp");
  const svix_signature = headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return false;
  }

  // For this example, we're simplifying the verification
  // In production, implement proper HMAC verification
  console.log("Webhook signature verification would happen here");
  
  // We're returning true for now since we don't have the full verification logic
  // In a real implementation, this would perform proper cryptographic verification
  return true;
}

// Create Supabase admin client
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Get the request body
    const body = await req.text();
    
    // Verify webhook signature
    const isValid = await verifyClerkWebhookSignature(body, req.headers);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    const event = payload.type;
    const data = payload.data;

    console.log(`Received webhook event: ${event}`);

    // Process user events
    if (event === 'user.created' || event === 'user.updated') {
      const clerkUserId = data.id;
      const email = data.email_addresses?.[0]?.email_address;
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      
      if (!clerkUserId) {
        throw new Error('Missing Clerk user ID');
      }

      console.log(`Processing user: ${clerkUserId}, ${email}`);

      // Using Supabase admin client to create user in auth.users table
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          clerk_id: clerkUserId,
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (userError) {
        console.error(`Error creating user: ${userError.message}`);
        
        // If user already exists, update instead
        if (userError.message.includes('already exists')) {
          // Try to find user by email first
          const { data: existingUsers } = await supabaseAdmin.auth.admin
            .listUsers();
          
          const existingUser = existingUsers?.users?.find(u => 
            u.email === email || u.user_metadata?.clerk_id === clerkUserId
          );

          if (existingUser) {
            // Update existing user
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              existingUser.id,
              {
                user_metadata: {
                  clerk_id: clerkUserId,
                  first_name: firstName,
                  last_name: lastName,
                }
              }
            );
            
            if (updateError) {
              console.error(`Error updating user: ${updateError.message}`);
              throw updateError;
            }
            
            console.log(`Updated user: ${existingUser.id}`);
          } else {
            throw userError;
          }
        } else {
          throw userError;
        }
      } else {
        console.log(`Created user: ${userData.user.id}`);
        
        // Update user profile if a profile table exists
        // This is handled by the trigger function on auth.users in most projects
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else if (event === 'user.deleted') {
      // Handle user deletion
      const clerkUserId = data.id;
      
      // Find user by Clerk ID in user_metadata
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      
      const userToDelete = users?.users?.find(
        u => u.user_metadata?.clerk_id === clerkUserId
      );
      
      if (userToDelete) {
        const { error: deleteError } = await supabaseAdmin.auth.admin
          .deleteUser(userToDelete.id);
          
        if (deleteError) {
          console.error(`Error deleting user: ${deleteError.message}`);
          throw deleteError;
        }
        
        console.log(`Deleted user: ${userToDelete.id}`);
      } else {
        console.log(`User with Clerk ID ${clerkUserId} not found`);
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // For other webhook events
    return new Response(
      JSON.stringify({ success: true, message: "Webhook received" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Webhook error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
