
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new Error('User not authenticated')

    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!subscriber?.stripe_customer_id) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: subscriber.stripe_customer_id,
      status: 'active',
    })

    const hasActiveSubscription = subscriptions.data.length > 0
    const subscription = subscriptions.data[0]

    if (hasActiveSubscription) {
      await supabase.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: subscriber.stripe_customer_id,
        subscribed: true,
        subscription_tier: subscription.items.data[0].price.nickname || 'pro',
        subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
    }

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSubscription,
        subscription: hasActiveSubscription ? subscription : null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
