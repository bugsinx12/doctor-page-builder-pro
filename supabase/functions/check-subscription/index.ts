
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logStep('Function started');
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })
    logStep('Stripe initialized');

    // Get the user information from Clerk request
    const authHeader = req.headers.get('Authorization')
    logStep('Auth header', { authHeader: authHeader ? 'present' : 'missing' });
    
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'No authorization header provided',
        subscribed: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Extract user ID and email from the authorization header (from Clerk)
    const authData = JSON.parse(atob(authHeader.split(' ')[1]));
    logStep('Auth data extracted', { authData });
    
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logStep('Supabase credentials missing');
      return new Response(JSON.stringify({ 
        error: 'Supabase configuration is missing',
        subscribed: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    // Using service role to bypass RLS since we're authenticating with Clerk
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )
    
    // Check for existing subscriber info
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (subscriberError) {
      logStep('Error retrieving subscriber data', { error: subscriberError.message });
      return new Response(JSON.stringify({ 
        error: 'Database error: ' + subscriberError.message,
        subscribed: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    logStep('Subscriber data', { subscriber });

    if (!subscriber?.stripe_customer_id) {
      logStep('No Stripe customer ID found');
      // Create a default subscriber record if one doesn't exist
      const { error: upsertError } = await supabase.from('subscribers').upsert({
        user_id: userId,
        email: userEmail,
        subscribed: false
      });
      
      if (upsertError) {
        logStep('Error creating subscriber record', { error: upsertError.message });
      }
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Check for active Stripe subscriptions
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: subscriber.stripe_customer_id,
        status: 'active',
      });
  
      const hasActiveSubscription = subscriptions.data.length > 0;
      const subscription = hasActiveSubscription ? subscriptions.data[0] : null;
      
      logStep('Subscription status', { 
        hasActiveSubscription, 
        subscriptionId: subscription?.id 
      });
  
      if (hasActiveSubscription && subscription) {
        // Update subscriber record with latest info
        const { error: upsertError } = await supabase.from('subscribers').upsert({
          user_id: userId,
          email: userEmail,
          stripe_customer_id: subscriber.stripe_customer_id,
          subscribed: true,
          subscription_tier: subscription.items.data[0].price.nickname || 'pro',
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
        
        if (upsertError) {
          logStep('Error updating subscriber record', { error: upsertError.message });
        } else {
          logStep('Updated subscriber record');
        }
      }
  
      return new Response(
        JSON.stringify({
          subscribed: hasActiveSubscription,
          subscription: hasActiveSubscription && subscription ? {
            id: subscription.id,
            tier: subscription.items.data[0].price.nickname || 'pro',
            current_period_end: subscription.current_period_end
          } : null,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (stripeError) {
      logStep('Stripe API error', { error: stripeError.message });
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          error: 'Stripe API error: ' + stripeError.message 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 even for Stripe errors so the frontend can handle it
        }
      );
    }
  } catch (error) {
    logStep('ERROR', { message: error.message });
    return new Response(JSON.stringify({ 
      error: error.message,
      subscribed: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 so the frontend can handle the error
    });
  }
})
