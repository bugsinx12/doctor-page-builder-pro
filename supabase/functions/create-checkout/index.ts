
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_IDS = {
  pro: 'price_1RFfmnPPH3xmvXAxMK84vJY0',
  enterprise: 'price_1RFfnGPPH3xmvXAxbRD5E6Wm',
}

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logStep('Function started');
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ 
        error: 'STRIPE_SECRET_KEY environment variable is not set'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    // Initialize Stripe with test mode flag explicitly set
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
    logStep('Stripe initialized');

    // Get the user information from Clerk request
    const authHeader = req.headers.get('Authorization')
    logStep('Auth header', { authHeader: authHeader ? 'present' : 'missing' });
    
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'No authorization header provided'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Extract user ID and email from the authorization header (from Clerk)
    let authData;
    try {
      authData = JSON.parse(atob(authHeader.split(' ')[1]));
      logStep('Auth data extracted', { authData });
    } catch (error) {
      logStep('Error parsing auth data', { error: error.message });
      return new Response(JSON.stringify({ 
        error: 'Invalid authorization data format'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    if (!authData.userId || !authData.userEmail) {
      return new Response(JSON.stringify({ 
        error: 'Invalid authorization data. Missing userId or userEmail',
        subscribed: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    const userId = authData.userId;
    const userEmail = authData.userEmail;
    
    logStep('User authenticated', { userId, email: userEmail });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      logStep('Supabase credentials missing');
      return new Response(JSON.stringify({ 
        error: 'Supabase configuration is missing'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    // Using service role to bypass RLS since we're authenticating with Clerk
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    )
    
    // Get the plan from the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      logStep('JSON parsing error', { error: jsonError.message });
      return new Response(JSON.stringify({ 
        error: 'Invalid request format: ' + jsonError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    const { plan } = requestBody;
    
    if (!plan || !PRICE_IDS[plan]) {
      logStep('Invalid plan', { plan });
      return new Response(JSON.stringify({ 
        error: 'Invalid plan selected'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    logStep('Plan selected', { plan, priceId: PRICE_IDS[plan] });
    
    // Check if user already has a Stripe customer ID
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (subscriberError) {
      logStep('Error retrieving subscriber data', { error: subscriberError.message });
      return new Response(JSON.stringify({ 
        error: 'Database error: ' + subscriberError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    logStep('Subscriber data', { subscriber });
    let customerId = subscriber?.stripe_customer_id;

    // If no customer ID exists, create a new customer
    if (!customerId) {
      logStep('Creating new Stripe customer');
      try {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            clerk_user_id: userId,
          },
        });
        customerId = customer.id;
        logStep('Customer created', { customerId });

        // Store the customer ID in our database
        const { error: upsertError } = await supabase.from('subscribers').upsert({
          user_id: userId,
          email: userEmail,
          stripe_customer_id: customerId,
        });
        
        if (upsertError) {
          logStep('Error storing customer ID', { error: upsertError.message });
          return new Response(JSON.stringify({ 
            error: 'Failed to store customer ID: ' + upsertError.message
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          });
        }
        
        logStep('Customer ID stored in database');
      } catch (stripeError) {
        logStep('Error creating Stripe customer', { error: stripeError.message });
        return new Response(JSON.stringify({ 
          error: 'Failed to create Stripe customer: ' + stripeError.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    // Create a Stripe checkout session
    logStep('Creating checkout session');
    try {
      // Get the origin from request headers or use a default
      const origin = req.headers.get('origin') || 'https://app.boost.doctor';
      
      // Create a checkout session with automatic tax calculation disabled
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: PRICE_IDS[plan],
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/dashboard?success=true`,
        cancel_url: `${origin}/pricing?canceled=true`,
        allow_promotion_codes: true,
        // Explicitly disable tax collection since we're in test mode
        automatic_tax: { enabled: false },
      });
      
      logStep('Checkout session created', { sessionId: session.id, sessionUrl: session.url });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (stripeError) {
      logStep('Error creating checkout session', { error: stripeError.message, errorObject: stripeError });
      return new Response(JSON.stringify({ 
        error: 'Failed to create checkout session: ' + stripeError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to prevent browser error, but include the error message
      });
    }
  } catch (error) {
    logStep('ERROR', { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 to prevent browser error, but include the error message
    });
  }
})
