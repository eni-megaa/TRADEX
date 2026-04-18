import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CreditCard, Edit2, CheckCircle2, AlertCircle, X, Loader2, Save } from 'lucide-react';

export const AdminPaymentProvidersPage = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Configuration Modal State
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [configForm, setConfigForm] = useState({
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    supportedCountries: '',
    min: 0,
    max: 0,
    fee: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('payment_providers').select('*').order('name');
    if (!error && data) {
      setProviders(data);
    } else {
      setMsg({ type: 'error', text: 'Failed to fetch providers. Make sure migrations are run.'});
    }
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase.from('payment_providers').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setMsg({ type: 'success', text: `Provider status updated to ${newStatus}` });
      fetchProviders();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const openConfigModal = (provider: any) => {
    setSelectedProvider(provider);
    const cfg = provider.config || {};
    setConfigForm({
      publicKey: cfg.public_key || '',
      secretKey: cfg.secret_key || '',
      webhookSecret: cfg.webhook_secret || '',
      supportedCountries: provider.supported_countries.join(', '),
      min: provider.min_deposit_limit,
      max: provider.max_deposit_limit,
      fee: provider.deposit_fee_percentage
    });
  };

  const saveConfig = async () => {
    if (!selectedProvider) return;
    setSaving(true);
    setMsg(null);
    try {
      // Parse countries
      const countriesArray = configForm.supportedCountries.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
      
      const payload = {
        min_deposit_limit: configForm.min,
        max_deposit_limit: configForm.max,
        deposit_fee_percentage: configForm.fee,
        supported_countries: countriesArray,
        config: {
          public_key: configForm.publicKey,
          secret_key: configForm.secretKey,
          webhook_secret: configForm.webhookSecret
        }
      };

      const { error } = await supabase.from('payment_providers').update(payload).eq('id', selectedProvider.id);
      if (error) throw error;
      
      setMsg({ type: 'success', text: `${selectedProvider.name} configuration saved successfully.`});
      setSelectedProvider(null);
      fetchProviders();
    } catch (e: any) {
       setMsg({ type: 'error', text: e.message });
    } finally {
       setSaving(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Payment <span className="text-accent">Gateways</span></h1>
        <p className="text-gray-500 font-medium">Configure supported deposit and withdrawal methods, API keys, and limits.</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
          {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-bold text-sm tracking-wide">{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-10">Loading configurations...</div>
      ) : providers.length === 0 ? (
         <div className="text-center p-10 bg-navy/50 border border-white/5 rounded-3xl">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Providers Found</h3>
            <p className="text-gray-500">Please run the latest SQL migration down in your Supabase dashboard to seed the core gateways.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className={`bg-navy border rounded-3xl p-6 relative overflow-hidden group transition-all ${provider.status === 'active' ? 'border-accent/40 shadow-lg shadow-accent/5' : 'border-white/5'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <CreditCard className={`w-5 h-5 ${provider.status === 'active' ? 'text-accent' : 'text-gray-500'}`} />
                    <h3 className="text-xl font-bold text-white">{provider.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{provider.type}</span>
                </div>
                
                <button 
                  onClick={() => toggleStatus(provider.id, provider.status)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${provider.status === 'active' ? 'bg-accent' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${provider.status === 'active' ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-navy-light/50 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-500 block mb-1 uppercase font-bold tracking-wider">Regions</span>
                  <div className="flex flex-wrap gap-1">
                    {provider.supported_countries.map((country: string) => (
                      <span key={country} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-xs font-bold text-white/80">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-navy-light/50 p-3 rounded-xl border border-white/5">
                     <span className="text-xs text-gray-500 block mb-1 uppercase font-bold tracking-wider">Min / Max</span>
                     <span className="font-mono text-white text-sm block">${provider.min_deposit_limit} - ${provider.max_deposit_limit}</span>
                  </div>
                  <div className="bg-navy-light/50 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                     <span className="text-xs text-gray-500 block mb-1 uppercase font-bold tracking-wider">Deposit Fee</span>
                     <span className="font-mono text-accent text-sm font-bold block">{provider.deposit_fee_percentage}%</span>
                  </div>
                </div>

                {(!provider.config || !provider.config.secret_key) && (
                   <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-2">
                      <AlertCircle className="w-3 h-3" /> Needs API Key Config
                   </div>
                )}
                
                 <button onClick={() => openConfigModal(provider)} className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold tracking-wider uppercase flex justify-center items-center gap-2 transition-all">
                    <Edit2 className="w-3 h-3" /> Setup Configuration
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SETUP API MODAL */}
      {selectedProvider && (
         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-navy border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
               <div className="p-6 border-b border-white/5 flex justify-between items-center bg-navy-light/50">
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">Configure {selectedProvider.name}</h2>
                    <p className="text-xs text-gray-400">Set API credentials and operational limits.</p>
                  </div>
                  <button onClick={() => setSelectedProvider(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar">
                  {/* API KEYS SECTION */}
                  <div className="space-y-3">
                     <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">API Credentials</h3>
                     
                     <div>
                       <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Public/Publishable Key</label>
                       <input 
                         type="text" value={configForm.publicKey} onChange={e => setConfigForm({...configForm, publicKey: e.target.value})}
                         className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent outline-none font-mono"
                         placeholder="pk_test_..."
                       />
                     </div>
                     <div>
                       <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Secret Key <span className="text-red-400">*</span></label>
                       <input 
                         type="password" value={configForm.secretKey} onChange={e => setConfigForm({...configForm, secretKey: e.target.value})}
                         className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent outline-none font-mono"
                         placeholder="sk_test_..."
                       />
                     </div>
                     <div>
                       <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Webhook Secret</label>
                       <input 
                         type="password" value={configForm.webhookSecret} onChange={e => setConfigForm({...configForm, webhookSecret: e.target.value})}
                         className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent outline-none font-mono"
                         placeholder="whsec_..."
                       />
                        <p className="text-[10px] text-gray-500 mt-1 pb-2">Required for validating incoming webhooks in Edge Functions.</p>
                     </div>
                  </div>

                  {/* OPERATIONAL LIMITS SECTION */}
                  <div className="space-y-3 pt-2">
                     <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest border-b border-white/5 pb-2">Operations & Limits</h3>
                     
                     <div>
                       <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Supported Countries (Comma Separated)</label>
                       <input 
                         type="text" value={configForm.supportedCountries} onChange={e => setConfigForm({...configForm, supportedCountries: e.target.value})}
                         className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent outline-none font-mono uppercase"
                         placeholder="US, GB, GLOBAL"
                       />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                         <div>
                           <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Min Deposit</label>
                           <input type="number" value={configForm.min} onChange={e => setConfigForm({...configForm, min: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent outline-none font-mono" />
                         </div>
                         <div>
                           <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Max Deposit</label>
                           <input type="number" value={configForm.max} onChange={e => setConfigForm({...configForm, max: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent outline-none font-mono" />
                         </div>
                     </div>
                     <div>
                           <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Deposit Fee (%)</label>
                           <input type="number" step="0.01" value={configForm.fee} onChange={e => setConfigForm({...configForm, fee: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent outline-none font-mono" />
                     </div>
                  </div>
               </div>
               
               <div className="p-4 border-t border-white/5 bg-navy-light/30 flex justify-end gap-3">
                  <button onClick={() => setSelectedProvider(null)} className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button onClick={saveConfig} disabled={saving} className="px-5 py-2.5 bg-accent hover:brightness-110 rounded-xl font-bold text-xs uppercase text-white transition-all flex items-center gap-2">
                     {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Configuration</>}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
