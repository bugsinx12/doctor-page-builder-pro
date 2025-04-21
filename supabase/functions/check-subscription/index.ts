
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
      // Proper handling of bearer token format
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;
        
      authData = JSON.parse(atob(token));
      logStep('Auth data extracted', { authData });
    } catch (error) {
      logStep('Error parsing auth data', { error: error.message });
      return new Response(JSON.stringify({ 
        error: 'Invalid authorization data format', 
        subscribed: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    if (!authData.userId || !authData.userEmail) {
      return new Response(JSON.stringify({ 
        error: 'Invalid authorization data. Missing userId or userEmail',
        subscribed: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
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
      supabaseServiceRoleKey
    )
    
    // Check for existing subscriber info
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (subscriberError) {
      logStep('Error retrieving subscriber data', { error: subscriberError.message });
      return new Response(JSON.stringify({ 
        error: 'Error retrieving subscriber data',
        subscribed: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    logStep('Subscriber data', { subscriber });

    // For development/testing purposes:
    // If no subscription record exists, create one
    if (!subscriber) {
      logStep('No subscriber record found, creating one');
      
      // Insert a new subscriber record
      const { error: insertError } = await supabase
        .from('subscribers')
        .insert({
          user_id: userId,
          email: userEmail,
          subscribed: true, // For testing we're setting this to true
          subscription_tier: 'Premium',
          subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        
      if (insertError) {
        logStep('Error creating subscriber record', { error: insertError.message });
        return new Response(JSON.stringify({ 
          error: 'Error creating subscriber record',
          subscribed: false
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
      
      // Return the newly created subscription data
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: "Premium",
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Return the subscription data from the database
    return new Response(JSON.stringify({
      subscribed: subscriber.subscribed,
      subscription_tier: subscriber.subscription_tier,
      subscription_end: subscriber.subscription_end,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    logStep('ERROR', { message: error.message });
    return new Response(JSON.stringify({ 
      error: error.message,
      subscribed: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})
