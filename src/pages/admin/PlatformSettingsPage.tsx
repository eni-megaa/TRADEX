import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, ShieldCheck, Radio, Cpu, Wallet, AlertTriangle } from 'lucide-react';

export const PlatformSettingsPage = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('feature_name', { ascending: true });
      
    if (!error && data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleToggle = (id: string, currentVal: boolean) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, is_enabled: !currentVal } : s));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMsg(null);
    try {
      for (const s of settings) {
        await supabase
          .from('admin_settings')
          .update({ is_enabled: s.is_enabled })
          .eq('id', s.id);
      }
      setMsg({ type: 'success', text: 'Platform configuration updated successfully.' });
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Accessing core configuration...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Platform <span className="text-accent">Control</span></h1>
          <p className="text-gray-500 font-medium">Global feature toggles and system-wide operational parameters.</p>
        </div>
        <button 
           onClick={saveSettings}
           disabled={saving}
           className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-50"
        >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Commit Changes</span>
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-sm animate-in fade-in slide-in-from-top-4 ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
           <div className="flex items-center space-x-3">
              {msg.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span className="font-bold">{msg.text}</span>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Trading Features */}
        <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-8">
                <Cpu className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Trading Infrastructure</h3>
            </div>
            
            <div className="space-y-4">
                {settings.filter(s => s.feature_name.includes('trading') || s.feature_name.includes('market')).map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 bg-navy/50 rounded-2xl border border-white/5 group hover:border-accent/20 transition-all">
                        <div className="flex-1 pr-4">
                            <h4 className="font-bold text-white capitalize group-hover:text-accent transition-colors">{setting.feature_name.replace(/_/g, ' ')}</h4>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Real-time Execution</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={setting.is_enabled}
                              onChange={() => handleToggle(setting.id, setting.is_enabled)}
                            />
                            <div className="w-12 h-6 bg-navy-dark border border-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-600 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent peer-checked:after:bg-white"></div>
                        </label>
                    </div>
                ))}
            </div>
        </div>

        {/* User Operations */}
        <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-8">
                <Wallet className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Financial & User Ops</h3>
            </div>
            
            <div className="space-y-4">
                {settings.filter(s => !s.feature_name.includes('trading') && !s.feature_name.includes('market')).map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 bg-navy/50 rounded-2xl border border-white/5 group hover:border-accent/20 transition-all">
                        <div className="flex-1 pr-4">
                            <h4 className="font-bold text-white capitalize group-hover:text-accent transition-colors">{setting.feature_name.replace(/_/g, ' ')}</h4>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Operational State</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={setting.is_enabled}
                              onChange={() => handleToggle(setting.id, setting.is_enabled)}
                            />
                            <div className="w-12 h-6 bg-navy-dark border border-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-600 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent peer-checked:after:bg-white"></div>
                        </label>
                    </div>
                ))}
            </div>
        </div>

        {/* System Health */}
        <div className="md:col-span-2 bg-navy-light/40 border border-white/5 rounded-3xl p-8 shadow-xl flex items-center justify-between">
            <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-navy rounded-2xl border border-white/5 flex items-center justify-center">
                    <Radio className="w-8 h-8 text-green-500 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">System Core Status</h3>
                    <p className="text-gray-500 text-sm">All operational services are responding within expected latency.</p>
                </div>
            </div>
            <div className="hidden lg:flex space-x-8">
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Database</p>
                    <p className="text-green-500 font-bold">OPTIMAL</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Real-time</p>
                    <p className="text-green-500 font-bold">CONNECTED</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Auth-Edge</p>
                    <p className="text-green-500 font-bold">STABLE</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
