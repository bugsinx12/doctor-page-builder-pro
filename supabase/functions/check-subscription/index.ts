import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    logStep("Function started");
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract the JWT token
    const token = authHeader.split(" ")[1];
    logStep("Token received", { token: token.substring(0, 10) + "..." });

    // Get the user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logStep("Invalid auth token", { error: userError });
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;
    const userEmail = user.email;
    
    logStep("Checking subscription for user:", { userId, userEmail });

    // Initialize Stripe
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) {
        logStep("Stripe key not found");
        throw new Error("STRIPE_SECRET_KEY is not configured");
      }
      
      // Using dynamic import for Stripe
      const { default: Stripe } = await import("https://esm.sh/stripe@14.21.0");
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
      
      // Check if subscriber exists in DB
      const { data: subscriber, error: fetchError } = await supabase
        .from("subscribers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        logStep("Error fetching subscriber", { error: fetchError });
        throw new Error(`Error fetching subscriber: ${fetchError.message}`);
      }

      // If no subscriber record exists, create one
      if (!subscriber) {
        logStep("No subscriber record found, creating one", { userId, userEmail });
        
        // Create subscriber record with default values
        const { data: newSubscriber, error: insertError } = await supabase
          .from("subscribers")
          .insert({
            user_id: userId,
            email: userEmail || "",
            subscribed: false,
          })
          .select()
          .single();

        if (insertError) {
          logStep("Error creating subscriber record", { error: insertError });
          return new Response(
            JSON.stringify({ error: "Error creating subscriber record", details: insertError }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        logStep("Created new subscriber record", { newSubscriber });
        
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
      
      logStep("Found existing subscriber", { subscriber });
      
      // Check if we already have a Stripe customer ID
      if (subscriber.stripe_customer_id) {
        logStep("Subscriber has Stripe customer ID", { customerId: subscriber.stripe_customer_id });
        
        try {
          // Check for active subscriptions
          const subscriptions = await stripe.subscriptions.list({
            customer: subscriber.stripe_customer_id,
            status: 'active',
            limit: 1,
          });
          
          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            logStep("Found active subscription", { 
              subscriptionId: subscription.id,
              status: subscription.status 
            });
            
            // Get subscription details
            const endDate = new Date(subscription.current_period_end * 1000).toISOString();
            
            // Get price ID from subscription
            const priceId = subscription.items.data[0].price.id;
            const price = await stripe.prices.retrieve(priceId);
            
            // Determine tier based on price
            let tier = "premium"; // Default tier
            if (price.id === Deno.env.get("STRIPE_ENTERPRISE_PRICE_ID")) {
              tier = "enterprise";
            } else if (price.id === Deno.env.get("STRIPE_PRO_PRICE_ID")) {
              tier = "pro";
            }
            
            // Update subscriber with subscription details if needed
            if (!subscriber.subscribed || 
                subscriber.subscription_tier !== tier || 
                subscriber.subscription_end !== endDate) {
              
              const { error: subUpdateError } = await supabase
                .from("subscribers")
                .update({ 
                  subscribed: true,
                  subscription_tier: tier,
                  subscription_end: endDate,
                  updated_at: new Date().toISOString()
                })
                .eq("user_id", userId);
                
              if (subUpdateError) {
                logStep("Error updating subscription details", { error: subUpdateError });
              } else {
                logStep("Updated subscription details successfully");
              }
            }
            
            // Return updated subscription status
            return new Response(
              JSON.stringify({
                subscribed: true,
                subscription_tier: tier,
                subscription_end: endDate,
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          } else {
            // No active subscription
            logStep("No active subscription found");
            
            // Update subscriber to not subscribed if it was previously subscribed
            if (subscriber.subscribed) {
              const { error: subUpdateError } = await supabase
                .from("subscribers")
                .update({ 
                  subscribed: false,
                  subscription_tier: null,
                  subscription_end: null,
                  updated_at: new Date().toISOString()
                })
                .eq("user_id", userId);
                
              if (subUpdateError) {
                logStep("Error updating subscription details", { error: subUpdateError });
              } else {
                logStep("Updated subscription to not subscribed");
              }
            }
          }
        } catch (stripeError) {
          logStep("Error checking Stripe subscriptions", { error: stripeError });
        }
      } else {
        // We don't have a Stripe customer ID, so check if one exists by email
        try {
          logStep("Looking for Stripe customer by email", { email: subscriber.email });
          const customers = await stripe.customers.list({
            email: subscriber.email,
            limit: 1,
          });
          
          if (customers.data.length > 0) {
            const customer = customers.data[0];
            logStep("Found customer in Stripe", { customerId: customer.id });
            
            // Update subscriber with Stripe customer ID
            const { error: updateError } = await supabase
              .from("subscribers")
              .update({ 
                stripe_customer_id: customer.id,
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userId);
              
            if (updateError) {
              logStep("Error updating subscriber with Stripe customer ID", { error: updateError });
            } else {
              logStep("Updated subscriber with Stripe customer ID");
              
              // Check for active subscriptions
              const subscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: 'active',
                limit: 1,
              });
              
              if (subscriptions.data.length > 0) {
                const subscription = subscriptions.data[0];
                logStep("Found active subscription", { 
                  subscriptionId: subscription.id,
                  status: subscription.status 
                });
                
                // Get subscription details
                const endDate = new Date(subscription.current_period_end * 1000).toISOString();
                
                // Get price ID from subscription
                const priceId = subscription.items.data[0].price.id;
                const price = await stripe.prices.retrieve(priceId);
                
                // Determine tier based on price
                let tier = "premium"; // Default tier
                if (price.id === Deno.env.get("STRIPE_ENTERPRISE_PRICE_ID")) {
                  tier = "enterprise";
                } else if (price.id === Deno.env.get("STRIPE_PRO_PRICE_ID")) {
                  tier = "pro";
                }
                
                // Update subscriber with subscription details
                const { error: subUpdateError } = await supabase
                  .from("subscribers")
                  .update({ 
                    subscribed: true,
                    subscription_tier: tier,
                    subscription_end: endDate,
                    updated_at: new Date().toISOString()
                  })
                  .eq("user_id", userId);
                  
                if (subUpdateError) {
                  logStep("Error updating subscription details", { error: subUpdateError });
                } else {
                  logStep("Updated subscription details successfully");
                  
                  // Return updated subscription status
                  return new Response(
                    JSON.stringify({
                      subscribed: true,
                      subscription_tier: tier,
                      subscription_end: endDate,
                    }),
                    {
                      headers: { ...corsHeaders, "Content-Type": "application/json" },
                    }
                  );
                }
              }
            }
          } else {
            logStep("No Stripe customer found for this user");
          }
        } catch (stripeError) {
          logStep("Error checking Stripe by email", { error: stripeError });
        }
      }
      
      // Return current subscription status from DB
      return new Response(
        JSON.stringify({
          subscribed: subscriber.subscribed || false,
          subscription_tier: subscriber.subscription_tier,
          subscription_end: subscriber.subscription_end,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
      
    } catch (stripeInitError) {
      logStep("Error initializing Stripe", { error: stripeInitError });
      
      // Return a response using the DB data only
      const { data: subscriber, error: fetchError } = await supabase
        .from("subscribers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
        
      if (fetchError || !subscriber) {
        logStep("Error fetching subscriber data", { error: fetchError });
        return new Response(
          JSON.stringify({ 
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            error: "Error fetching data"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          subscribed: subscriber.subscribed || false,
          subscription_tier: subscriber.subscription_tier,
          subscription_end: subscriber.subscription_end,
          error: "Error connecting to Stripe"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred",
        message: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
