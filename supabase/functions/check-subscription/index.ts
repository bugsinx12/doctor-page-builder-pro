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
    let authData;
    try {
      authData = JSON.parse(atob(authHeader.split(' ')[1]));
      logStep('Auth data extracted', { authData });
    } catch (error) {
      logStep('Error parsing auth data', { error: error.message });
      return new Response(JSON.stringify({ 
        error: 'Invalid authorization data format', 
        subscribed: false 
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      logStep('Supabase credentials missing');
      return new Response(JSON.stringify({ 
        error: 'Supabase configuration is missing',
        subscribed: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to prevent browser error
      });
    }
    
    // Using service role to bypass RLS since we're authenticating with Clerk
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
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
        status: 200 // Return 200 to prevent browser error
      });
    }
    
    logStep('Subscriber data', { subscriber });

    if (!subscriber?.stripe_customer_id) {
      logStep('No Stripe customer ID found');
      
      // Check if there's a customer in Stripe with this email
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      logStep('Stripe customers search result', { 
        found: customers.data.length > 0,
        customerId: customers.data.length > 0 ? customers.data[0].id : null 
      });
      
      if (customers.data.length > 0) {
        // We found a customer in Stripe but not in our database, let's create a record
        const stripeCustomerId = customers.data[0].id;
        
        // Create a subscriber record
        const { data: newSubscriber, error: createError } = await supabase
          .from('subscribers')
          .upsert({
            user_id: userId,
            email: userEmail,
            stripe_customer_id: stripeCustomerId,
          })
          .select()
          .single();
        
        if (createError) {
          logStep('Error creating subscriber record', { error: createError.message });
        } else {
          logStep('Created subscriber record', { newSubscriber });
          
          // Now check for active subscriptions for this customer
          const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'active',
            limit: 1,
          });
          
          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            logStep('Found active subscription in Stripe', { 
              subscriptionId: subscription.id,
              status: subscription.status
            });
            
            // Update subscriber with subscription info
            await supabase
              .from('subscribers')
              .update({
                subscribed: true,
                subscription_tier: subscription.items.data[0].price.nickname || 'pro',
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('user_id', userId);
            
            return new Response(JSON.stringify({
              subscribed: true,
              subscription_tier: subscription.items.data[0].price.nickname || 'pro',
              subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
        }
      }
      
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
      } else {
        // No active subscription found, update record to reflect this
        const { error: updateError } = await supabase.from('subscribers').update({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
        }).eq('user_id', userId);
        
        if (updateError) {
          logStep('Error updating subscriber record to non-subscribed', { error: updateError.message });
        }
      }
  
      return new Response(
        JSON.stringify({
          subscribed: hasActiveSubscription,
          subscription_tier: hasActiveSubscription && subscription ? 
            subscription.items.data[0].price.nickname || 'pro' : null,
          subscription_end: hasActiveSubscription && subscription ? 
            new Date(subscription.current_period_end * 1000).toISOString() : null,
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
      status: 200 // Return 200 to prevent browser error
    });
  }
})
