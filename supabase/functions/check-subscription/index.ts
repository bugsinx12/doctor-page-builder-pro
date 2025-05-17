
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Define CORS headers for preflight and regular responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "*",
};

serve(async (req) => {
  // Handle preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Initialize the Supabase client with the JWT from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const jwt = authHeader.split(" ")[1];
    
    // Create a supabase client with the access token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );
    
    // Get user id from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    if (userError || !user) {
      console.error("JWT validation error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userId = user.id;
    console.log("Processing subscription check for user:", userId);
    
    // Check if there's a subscription in Supabase
    const { data: subscriberData, error: subError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (subError) {
      console.error("Error fetching subscriber:", subError);
      return new Response(
        JSON.stringify({ error: "Database error when fetching subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return the subscription data or an empty response
    if (subscriberData) {
      // Here you would typically also check with Stripe API for the latest subscription status
      // But for now, we'll just return what's in the database
      return new Response(
        JSON.stringify({
          subscribed: subscriberData.subscribed || false,
          subscription_tier: subscriberData.subscription_tier,
          subscription_end: subscriberData.subscription_end,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // No subscription found
      return new Response(
        JSON.stringify({ subscribed: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
  } catch (error) {
    console.error("Error processing subscription check:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
