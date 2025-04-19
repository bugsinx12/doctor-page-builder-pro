
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_IDS = {
  pro: 'price_pro', // You'll need to replace this with your actual Stripe price ID
  enterprise: 'price_enterprise', // You'll need to replace this with your actual Stripe price ID
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get the user information from the request
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new Error('User not authenticated')

    // Get the plan from the request
    const { plan } = await req.json()
    if (!plan || !PRICE_IDS[plan]) throw new Error('Invalid plan selected')

    // Check if user already has a Stripe customer ID
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = subscriber?.stripe_customer_id

    // If no customer ID exists, create a new customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Store the customer ID in our database
      await supabase.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
      })
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
