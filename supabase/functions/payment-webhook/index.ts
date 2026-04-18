import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use the Service Role key since this is a backend-to-backend webhook call
// It needs to bypass RLS to write to the ledger securely
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify webhook signature (Mocked for brevity)
    // In production: const signature = req.headers.get('stripe-signature'); ...
    const payload = await req.json();
    const eventType = payload.type || payload.event;
    
    // Assume the payload has a metadata reference back to our transaction ID
    const reference = payload.data?.metadata?.reference || payload.data?.reference || payload.reference;
    
    if (!reference) throw new Error('No transaction reference found in webhook');

    // Only process successful charges
    if (eventType !== 'charge.success' && eventType !== 'payment_intent.succeeded') {
       return new Response(JSON.stringify({ received: true, ignored: true }), { headers: corsHeaders, status: 200 });
    }

    // 2. Fetch the pending transaction
    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', reference)
      .eq('status', 'pending')
      .single();

    if (txError || !tx) {
      throw new Error('Pending transaction not found or already processed');
    }

    // 3. Begin Double-Entry Ledger Posting
    // To ensure atomicity, ideally we use an RPC function, but we can do consecutive queries using the Admin role.
    
    // Get account IDs
    const { data: hotWallet } = await supabaseAdmin.from('financial_accounts').select('id').eq('name', 'System Hot Wallet').single();
    if (!hotWallet) throw new Error('System Hot Wallet account missing');

    // Make sure user has a Liability account (We owe them money). 
    // If they don't, create it.
    let userLiabilityAccount;
    const { data: userAccounts } = await supabaseAdmin.from('financial_accounts').select('id').eq('user_id', tx.user_id).eq('name', 'User Fiat Wallet');
    
    if (!userAccounts || userAccounts.length === 0) {
        const { data: newAcc } = await supabaseAdmin.from('financial_accounts').insert({
            user_id: tx.user_id,
            name: 'User Fiat Wallet',
            currency: 'USD',
            type: 'liability' // From broker's perspective, user funds are a liability
        }).select().single();
        userLiabilityAccount = newAcc.id;
    } else {
        userLiabilityAccount = userAccounts[0].id;
    }

    // Create the Journal Entry
    const { data: journal, error: journalErr } = await supabaseAdmin.from('journal_entries').insert({
        transaction_id: tx.id,
        description: `Deposit via Webhook for TX ${tx.id}`
    }).select().single();

    if (journalErr) throw new Error('Failed to create journal entry');

    // Post the Lines. Must be perfectly balanced.
    const { error: lineErr } = await supabaseAdmin.from('ledger_lines').insert([
        { journal_id: journal.id, account_id: hotWallet.id, amount: tx.amount, direction: 'DEBIT' }, // Bank/Processor got actual cash (Asset increase)
        { journal_id: journal.id, account_id: userLiabilityAccount, amount: tx.amount, direction: 'CREDIT' } // User balance increased (Liability increase)
    ]);

    if (lineErr) throw new Error(`Failed to insert ledger lines: ${JSON.stringify(lineErr)}`);

    // 4. Mark transaction as approved
    await supabaseAdmin.from('transactions').update({ status: 'approved' }).eq('id', tx.id);

    return new Response(JSON.stringify({ received: true, success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
