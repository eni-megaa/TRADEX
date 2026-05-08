import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle, CreditCard, ChevronRight, Loader2, Bitcoin, X } from 'lucide-react';
import { useKYCGuard } from '../../hooks/useKYCGuard';

export const WalletPage = () => {
  const { user, profile } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Flow State
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdrawal' | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { checkAccess } = useKYCGuard();

  useEffect(() => {
    fetchWalletData();
    if (profile?.country) {
      fetchProviders(profile.country);
    } else {
      fetchProviders('GLOBAL');
    }
  }, [user, profile]);

  const fetchWalletData = async () => {
    if (!user) return;
    try {
      const { data: balanceData } = await supabase
        .from('account_balances')
        .select('current_balance')
        .eq('user_id', user.id)
        .eq('name', 'User Fiat Wallet')
        .single();

      if (balanceData) {
        setBalance(Number(balanceData.current_balance));
      } else {
        const { data: oldWallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
        if (oldWallet) setBalance(Number(oldWallet.balance));
      }

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txData) setTransactions(txData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async (userCountry: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_providers')
        .select('*')
        .eq('status', 'active');

      if (error || !data || data.length === 0) throw new Error('DB fetch empty');

      const available = data.filter(p =>
        p.supported_countries.includes(userCountry) ||
        p.supported_countries.includes('GLOBAL')
      );
      setProviders(available);
    } catch (e) {
      setProviders([]);
    }
  };

  const closeModal = () => {
    setActiveAction(null);
    setAmount('');
    setSelectedProvider(null);
    setMsg(null);
  };

  const handleDepositSelected = (p: any) => {
    setMsg(null);
    const numAmount = Number(amount);

    if (numAmount <= 0) {
      return setMsg({ type: 'error', text: 'Please enter a valid amount first.' });
    }

    if (numAmount < p.min_deposit_limit) {
      return setMsg({ type: 'error', text: `Minimum deposit for ${p.name} is $${p.min_deposit_limit}` });
    }

    setSelectedProvider(p);
  };

  const executeDeposit = async () => {
    if (!user || !selectedProvider) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('payment-intent', {
        body: {
          amount: Number(amount),
          currency: 'USD',
          providerName: selectedProvider.name
        }
      });

      if (error) throw new Error(error.message || 'Payment initiation failed');

      if (data?.success) {
        setMsg({ type: 'success', text: 'Initializing checkout gateway...' });
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else if (data.clientSecret) {
          setMsg({ type: 'success', text: `Use secret/address: ${data.clientSecret}` });
        }
      }
    } catch (err: any) {
      if (err.message.includes('Function not found') || err.message.includes('Failed to fetch')) {
        setMsg({ type: 'success', text: 'Mock checkout initiated! (Edge functions pending deployment)' });
      } else {
        setMsg({ type: 'error', text: err.message });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    setMsg(null);
    if (!user) return;
    const numAmount = Number(amount);

    if (numAmount <= 0) return setMsg({ type: 'error', text: 'Amount must be greater than 0.' });
    if (numAmount > balance) return setMsg({ type: 'error', text: 'Insufficient balance for withdrawal.' });

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'withdrawal',
          amount: numAmount,
          status: 'pending'
        }]);

      if (error) throw error;
      setMsg({ type: 'success', text: 'Withdrawal request submitted successfully. It is pending admin approval.' });
      setAmount('');
      fetchWalletData();
      setTimeout(() => closeModal(), 3000);
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const getProviderIcon = (type: string, name: string) => {
    if (type === 'crypto') return <Bitcoin className="w-5 h-5 text-orange-400" />;

    if (name.toLowerCase().includes('stripe')) {
      return <div className="w-5 h-5 rounded bg-[#635BFF] flex items-center justify-center font-bold text-[10px] text-white">S</div>;
    }
    if (name.toLowerCase().includes('paystack')) {
      return <div className="w-5 h-5 rounded bg-[#0BA4DB] flex items-center justify-center font-bold text-[10px] text-white">P</div>;
    }
    return <CreditCard className="w-5 h-5 text-gray-400" />;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading wallet...</div>;

  return (
    <div className="p-4 flex flex-col space-y-6 lg:h-full min-h-0 relative">
      <div className="shrink-0">
        <h1 className="text-2xl font-black tracking-wide text-white leading-tight uppercase">My Wallet</h1>
        <p className="text-gray-400 text-xs mt-1">Manage funds and track transactions.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 lg:overflow-hidden">

        {/* Left Column: Balance & Action Triggers */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          <div className="bg-gradient-to-br from-navy-light to-navy border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden text-center shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[40px] pointer-events-none"></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Total Balance</p>
            <h2 className="text-5xl font-mono font-bold text-white relative z-10">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          </div>

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setActiveAction('deposit')}
              className="flex-1 bg-accent hover:brightness-110 text-white rounded-2xl py-4 font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-accent/20 flex flex-col items-center justify-center gap-2"
            >
              <ArrowDownLeft className="w-6 h-6" />
              Deposit
            </button>
            <button
              onClick={() => setActiveAction('withdrawal')}
              className="flex-1 bg-white hover:bg-gray-200 text-black rounded-2xl py-4 font-bold text-sm uppercase tracking-wider transition-all shadow-lg flex flex-col items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-6 h-6" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 flex flex-col h-full min-h-0 shadow-xl overflow-hidden">
            <h3 className="text-lg font-bold mb-6 text-white tracking-wide shrink-0">Recent Transfers</h3>

            <div className="flex-1 lg:overflow-y-auto hide-scrollbar space-y-3 pr-1 min-h-[300px] lg:h-full">
              {transactions.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 flex-col">
                  <Clock className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No transactions yet.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-navy/40 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 shadow-lg shrink-0 ${tx.type === 'deposit' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-500' : 'bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-500'}`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-white text-base capitalize">{tx.type}</p>
                        <p className="text-[10px] uppercase font-bold text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`font-mono text-lg font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-orange-500'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center space-x-1 bg-navy/50 px-2 py-1 rounded-lg border border-white/5 shrink-0">
                        {tx.status === 'approved' && <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-[9px] text-green-500 uppercase font-bold tracking-wider">OK</span></>}
                        {tx.status === 'pending' && <><Clock className="w-3 h-3 text-accent" /><span className="text-[9px] text-accent uppercase font-bold tracking-wider">WAIT</span></>}
                        {tx.status === 'rejected' && <><XCircle className="w-3 h-3 text-red-500" /><span className="text-[9px] text-red-500 uppercase font-bold tracking-wider">FAIL</span></>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Action Modals */}
      {activeAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy border border-white/10 rounded-3xl w-full max-w-lg min-h-[400px] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-navy-light/50 shrink-0">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wide">
                  {activeAction === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeAction === 'deposit' ? 'Fund your account securely.' : 'Transfer funds out of your account.'}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col overflow-y-auto">
              {msg && (
                <div className={`p-4 rounded-xl text-sm mb-6 font-bold shrink-0 flex items-start gap-3 ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                  {msg.type === 'error' ? <XCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                  {msg.text}
                </div>
              )}

              {/* ALWAYS SHOW AMOUNT INPUT FIRST IF NOT CONFIRMING */}
              {!(activeAction === 'deposit' && selectedProvider) && (
                <div className="shrink-0 mb-8">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Enter Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray-500 font-bold text-2xl">$</span>
                    <input
                      type="number" step="0.01" min="1"
                      className="w-full pl-10 pr-6 py-5 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-accent text-white font-mono font-black text-3xl transition-all"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  {activeAction === 'withdrawal' && (
                    <p className="text-xs font-mono text-gray-500 mt-2 text-right">Available: ${balance.toLocaleString()}</p>
                  )}
                </div>
              )}

              {/* DEPOSIT: GATEWAY SELECTION OR CONFIRMATION */}
              {activeAction === 'deposit' && (
                <>
                  {!selectedProvider ? (
                    <div className="space-y-3 flex-1">
                      <p className="text-[10px] font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2 mb-4">
                        Select Deposit Method
                      </p>

                      {providers.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-8 bg-black/20 rounded-2xl border border-white/5">
                          ❌ No gateways currently configured.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {providers.map(p => (
                            <button
                              key={p.id}
                              onClick={() => handleDepositSelected(p)}
                              className="w-full p-4 rounded-2xl border border-white/10 hover:border-accent/50 bg-black/40 hover:bg-white/5 flex items-center justify-between transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center border border-white/5 shrink-0">
                                  {getProviderIcon(p.type, p.name)}
                                </div>
                                <div className="text-left">
                                  <span className="font-bold text-white text-base block mb-0.5">{p.name} {p.type === 'crypto' ? 'Crypto' : 'Transfer'}</span>
                                  <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">Fees: {p.deposit_fee_percentage}% | Min: ${p.min_deposit_limit}</span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-accent transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1">
                      <button onClick={() => setSelectedProvider(null)} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline mb-6 flex items-center gap-1 w-max">
                        &larr; Back to Gateways
                      </button>

                      <div className="bg-black/30 border border-white/5 rounded-2xl p-6 mb-auto">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                          <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                            {getProviderIcon(selectedProvider.type, selectedProvider.name)}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Gateway</p>
                            <p className="text-lg font-bold text-white">{selectedProvider.name}</p>
                          </div>
                        </div>

                        <div className="space-y-4 text-sm font-mono text-gray-400">
                          <div className="flex justify-between items-center">
                            <span>Amount to Deposit</span>
                            <span className="text-white text-lg">${Number(amount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Processing Fee ({selectedProvider.deposit_fee_percentage}%)</span>
                            <span className="text-orange-400">${(Number(amount) * (selectedProvider.deposit_fee_percentage / 100)).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                            <span className="font-bold text-white uppercase tracking-widest text-[10px]">Total Charge</span>
                            <span className="text-green-400 font-bold text-xl">${(Number(amount) + (Number(amount) * (selectedProvider.deposit_fee_percentage / 100))).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => checkAccess(executeDeposit)}
                        disabled={processing}
                        className="mt-6 w-full py-4 rounded-xl font-bold text-white text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(176,107,255,0.3)] transition-all bg-accent hover:brightness-110 disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* WITHDRAWAL TARGET / CONFIRMATION */}
              {activeAction === 'withdrawal' && (
                <div className="flex flex-col flex-1">
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 mb-6">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Withdrawals require manual approval by our compliance team to satisfy AML/KYC requirements. Approvals typically take 1-3 business days.
                    </p>
                  </div>

                  <button
                    onClick={() => checkAccess(handleWithdrawalRequest)}
                    disabled={processing}
                    className="mt-auto w-full py-4 rounded-xl font-bold text-black text-sm uppercase tracking-wider shadow-lg transition-all bg-white hover:bg-gray-200 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : 'Request Review'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
