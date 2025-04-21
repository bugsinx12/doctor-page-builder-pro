
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Decode the auth token (simple base64 decode)
    const token = authHeader.split(" ")[1];
    let decodedData;
    try {
      decodedData = JSON.parse(atob(token));
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { userId, userEmail } = decodedData;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Checking subscription for user:", userId);

    // Check for existing subscriber record
    const { data: subscriber, error: fetchError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching subscriber:", fetchError);
      return new Response(
        JSON.stringify({ error: "Error fetching subscription data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If no subscriber record exists, create one
    if (!subscriber) {
      console.log("No subscriber record found, creating one");
      const { error: insertError } = await supabase
        .from("subscribers")
        .insert({
          user_id: userId,
          email: userEmail || "",
          subscribed: false,
        });

      if (insertError) {
        console.error("Error creating subscriber record:", insertError);
        return new Response(
          JSON.stringify({ error: "Error creating subscription record" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Return default subscription data for new users
      return new Response(
        JSON.stringify({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Found subscriber record:", subscriber);

    // Return subscription data
    return new Response(
      JSON.stringify({
        subscribed: subscriber.subscribed,
        subscription_tier: subscriber.subscription_tier,
        subscription_end: subscriber.subscription_end,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
