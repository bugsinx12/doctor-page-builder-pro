
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

  // For this demo implementation, we're simplifying the verification
  // In production, implement proper HMAC verification
  console.log("Webhook signature verification would happen here");
  
  // For now, we'll trust the webhook (assume it's properly verified)
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
      
      // Using RLS for the profile, we'll just make sure the profile exists
      const { data: existingProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', clerkUserId)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error checking for profile:", profileError);
      }
      
      // Create profile if it doesn't exist
      if (!existingProfile) {
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: clerkUserId,
            email: email || null,
            full_name: `${firstName} ${lastName}`.trim() || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw insertError;
        }
        
        console.log(`Created profile for user: ${clerkUserId}`);
      } else {
        // Update existing profile
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            email: email || null,
            full_name: `${firstName} ${lastName}`.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', clerkUserId);
          
        if (updateError) {
          console.error("Error updating profile:", updateError);
        } else {
          console.log(`Updated profile for user: ${clerkUserId}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
