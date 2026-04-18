import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getProvider } from "../_shared/payment-providers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Ensure user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { amount, currency, providerName } = await req.json();

    if (!amount || amount <= 0) throw new Error('Invalid amount');
    if (!providerName) throw new Error('Provider name is required');

    // Fetch user details for KYC/Billing info
    const { data: profile } = await supabaseClient
      .from('users_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const userConfig = {
      id: user.id,
      email: user.email!,
      name: profile?.full_name || 'Customer',
      country: profile?.country || 'US'
    };

    // 1. Verify Provider is actually Active in DB
    const { data: providerConfig, error: providerErr } = await supabaseClient
      .from('payment_providers')
      .select('*')
      .eq('name', providerName)
      .eq('status', 'active')
      .single();

    if (providerErr || !providerConfig) {
      throw new Error(`Payment provider '${providerName}' is not active or available.`);
    }

    // 2. Enforce limits based on DB config
    if (amount < providerConfig.min_deposit_limit || amount > providerConfig.max_deposit_limit) {
      throw new Error(`Amount must be between ${providerConfig.min_deposit_limit} and ${providerConfig.max_deposit_limit}`);
    }

    // 3. Create a pending transaction record with a unique reference
    const reference = `tx_${crypto.randomUUID()}`;
    
    // Fee calculation (add DB fee %)
    const fee = (amount * providerConfig.deposit_fee_percentage) / 100;
    const grossAmount = amount + fee;

    const { error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        id: reference, // we use the UUID directly or generate one
        user_id: user.id,
        type: 'deposit',
        amount: amount, // net amount credited to user
        status: 'pending',
      });
      
    if (txError) throw new Error('Failed to initialize transaction record');

    // 4. Call the Abstraction Layer
    const provider = getProvider(providerName);
    const result = await provider.createDepositIntent(grossAmount, currency, userConfig, reference);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
