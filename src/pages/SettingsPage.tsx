import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react';

export const SettingsPage = () => {
  const { user, profile, fetchProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMsg(null);

    try {
      // Update users table in public schema
      const { error: dbError } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Update auth meta data
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) throw authError;

      await fetchProfile(user.id);
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col space-y-4 lg:h-full min-h-0">
      <div className="shrink-0">
        <h1 className="text-xl font-black tracking-wide text-white mb-1">Account Settings</h1>
        <p className="text-gray-400 text-xs">Manage your profile, security preferences, and KYC verification.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 lg:overflow-hidden">
        
        {/* Profile Form */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-4 shadow-xl flex flex-col h-full">
            <h3 className="text-base font-bold mb-4 flex items-center text-white shrink-0 font-display">
              <User className="w-5 h-5 mr-2 text-accent" />
              Profile Information
            </h3>

             {msg && (
              <div className={`p-3 rounded-xl text-xs mb-4 font-medium shrink-0 ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 flex-1 overflow-y-auto hide-scrollbar pb-2">
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    disabled
                    className="w-full pl-10 pr-3 py-2.5 bg-navy/50 border border-white/5 rounded-2xl text-gray-400 cursor-not-allowed font-medium text-sm"
                    value={user?.email || ''}
                  />
                </div>
                <p className="mt-1 text-[9px] text-gray-500 font-bold italic">Email cannot be changed directly.</p>
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-navy/80 border border-white/5 rounded-2xl focus:outline-none focus:border-accent/50 text-white font-bold transition-all shadow-inner text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 w-full py-3 rounded-2xl font-black text-white text-xs uppercase tracking-wider shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-r from-accent to-accent-cyan shadow-accent/20 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security / Status */}
        <div className="flex flex-col space-y-4">
           <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-4 shadow-xl h-full">
            <h3 className="text-base font-bold mb-4 flex items-center text-white font-display">
              <Shield className="w-5 h-5 mr-2 text-accent-cyan" />
              Account Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex flex-col p-3 bg-navy/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Account Type</span>
                <span className="text-base font-black capitalize text-white">{profile?.role || 'User'}</span>
              </div>
              
              <div className="flex flex-col p-3 bg-navy/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">KYC Status</span>
                <span className={`text-xs font-black capitalize w-fit px-2 py-0.5 rounded-lg mt-1 ${
                  profile?.kyc_status === 'verified' ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
                  profile?.kyc_status === 'pending' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/20' :
                  'bg-red-500/20 text-red-500 border border-red-500/20'
                }`}>
                  {profile?.kyc_status || 'unverified'}
                </span>
              </div>

              {profile?.kyc_status !== 'verified' && (
                <button className="w-full text-center py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors border border-white/5 mt-2">
                  Verify Account
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
