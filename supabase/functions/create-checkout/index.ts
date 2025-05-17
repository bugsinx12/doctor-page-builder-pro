
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
      logStep('Error: Missing Stripe Secret Key');
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

    // Get the authorization header (JWT from Supabase)
    const authHeader = req.headers.get('Authorization')
    logStep('Auth header', { authHeader: authHeader ? 'present' : 'missing' });
    
    if (!authHeader) {
      logStep('Error: No auth header');
      return new Response(JSON.stringify({ 
        error: 'No authorization header provided'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Initialize Supabase client with admin/service role key
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
    
    // Create Supabase client with service role to bypass RLS
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    )
    
    // Verify JWT and get user information from auth token
    let token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      logStep('Error: Invalid auth token', { error: authError?.message });
      return new Response(JSON.stringify({ 
        error: 'Invalid authorization token',
        subscribed: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    const userId = user.id;
    const userEmail = user.email;
    
    if (!userId || !userEmail) {
      logStep('Error: Missing user data');
      return new Response(JSON.stringify({ 
        error: 'Invalid user data. Missing userId or userEmail',
        subscribed: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    logStep('User authenticated', { userId, email: userEmail });
    
    // Get the plan from the request body
    let requestBody;
    try {
      requestBody = await req.json();
      logStep('Request body parsed', { body: requestBody });
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
      
      // Try to create the subscribers table if it doesn't exist
      try {
        const { error: createTableError } = await supabase.rpc('create_subscribers_table_if_not_exists');
        if (createTableError) {
          logStep('Error creating subscribers table', { error: createTableError.message });
        } else {
          logStep('Subscribers table created successfully');
        }
      } catch (tableError) {
        logStep('Error handling subscribers table', { error: tableError.message });
      }
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
            supabase_user_id: userId,
          },
        });
        customerId = customer.id;
        logStep('Customer created', { customerId });

        // Store the customer ID in our database
        const { error: upsertError } = await supabase
          .from('subscribers')
          .upsert({
            user_id: userId,
            email: userEmail,
            stripe_customer_id: customerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (upsertError) {
          logStep('Error storing customer ID', { error: upsertError.message });
          // Continue anyway - we still want to create the checkout session
          logStep('Continuing with checkout despite upsert error');
        } else {
          logStep('Customer ID stored in database');
        }
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
      logStep('Using origin for redirect', { origin });
      
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
      
      if (stripeError.type === 'StripeInvalidRequestError') {
        logStep('Stripe Invalid Request Error', { 
          message: stripeError.message,
          code: stripeError.code,
          param: stripeError.param
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to create checkout session: ' + stripeError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
  } catch (error) {
    logStep('ERROR', { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})
