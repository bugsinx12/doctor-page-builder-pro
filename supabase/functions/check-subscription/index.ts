
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

    // Get the user information from the request
    const authHeader = req.headers.get('Authorization')
    logStep('Auth header', { authHeader: authHeader ? 'present' : 'missing' });
    
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      logStep('Auth error', { error: error.message });
      throw new Error('User authentication error: ' + error.message);
    }
    
    if (!user) {
      logStep('No user found');
      return new Response(JSON.stringify({ subscribed: false, error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    logStep('User authenticated', { userId: user.id, email: user.email });

    // Check for existing subscriber info
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (subscriberError) {
      logStep('Error retrieving subscriber data', { error: subscriberError.message });
      throw new Error('Database error: ' + subscriberError.message);
    }
    
    logStep('Subscriber data', { subscriber });

    if (!subscriber?.stripe_customer_id) {
      logStep('No Stripe customer ID found');
      // Create a default subscriber record if one doesn't exist
      await supabase.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        subscribed: false
      });
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
  
      if (hasActiveSubscription) {
        // Update subscriber record with latest info
        await supabase.from('subscribers').upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: subscriber.stripe_customer_id,
          subscribed: true,
          subscription_tier: subscription.items.data[0].price.nickname || 'pro',
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
        
        logStep('Updated subscriber record');
      }
  
      return new Response(
        JSON.stringify({
          subscribed: hasActiveSubscription,
          subscription: hasActiveSubscription ? {
            id: subscription.id,
            tier: subscription.items.data[0].price.nickname || 'pro',
            current_period_end: subscription.current_period_end
          } : null,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      status: 400,
    });
  }
})
