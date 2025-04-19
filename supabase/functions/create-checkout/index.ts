
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
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })
    logStep('Stripe initialized');

    // Get the user information from the request
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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logStep('Supabase credentials missing');
      return new Response(JSON.stringify({ 
        error: 'Supabase configuration is missing'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      logStep('Auth error', { error: error.message });
      return new Response(JSON.stringify({ 
        error: 'User authentication error: ' + error.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    if (!user) {
      logStep('No user found');
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    logStep('User authenticated', { userId: user.id, email: user.email });

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
      .eq('user_id', user.id)
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
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        });
        customerId = customer.id;
        logStep('Customer created', { customerId });

        // Store the customer ID in our database
        const { error: upsertError } = await supabase.from('subscribers').upsert({
          user_id: user.id,
          email: user.email,
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
      const origin = req.headers.get('origin') || 'https://app.boost.doctor';
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
      });
      logStep('Checkout session created', { sessionUrl: session.url });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (stripeError) {
      logStep('Error creating checkout session', { error: stripeError.message });
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
      status: 500,
    });
  }
})
