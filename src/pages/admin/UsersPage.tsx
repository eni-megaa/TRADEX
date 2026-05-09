import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Edit2, Ban, CheckCircle, Save, X, User as UserIcon, Trash2, History, ShieldAlert } from 'lucide-react';
import { UserHistoryModal } from '../../components/admin/UserHistoryModals';

export const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Edit modal state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editBalance, setEditBalance] = useState('');
  
  // History modal state
  const [historyType, setHistoryType] = useState<'trades' | 'transactions' | null>(null);
  const [historyUser, setHistoryUser] = useState<any | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Primary query with joins
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*, wallets(balance), kyc_documents(status)');
        
      if (fetchError) {
        console.warn('Primary fetch failed, trying fallback...', fetchError);
        // Fallback query (simpler, no joins)
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .select('*');
          
        if (fallbackError) throw fallbackError;
        setUsers(fallbackData || []);
      } else {
        setUsers(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      await supabase
        .from('wallets')
        .update({ balance: Number(editBalance) })
        .eq('user_id', editingUser.id);
        
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const roles: any[] = ['user', 'admin', 'moderator', 'finance_manager', 'support_agent'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    
    await supabase.from('users').update({ role: nextRole }).eq('id', userId);
    fetchUsers();
  };

  const toggleSuspension = async (userId: string, currentStatus: boolean) => {
    await supabase.from('users').update({ is_suspended: !currentStatus }).eq('id', userId);
    fetchUsers();
  };

  const toggleTradingSuspension = async (userId: string, currentStatus: boolean) => {
    await supabase.from('users').update({ is_trading_suspended: !currentStatus }).eq('id', userId);
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you absolutely sure you want to PERMANENTLY delete user "${userName}"? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase.rpc('delete_user', { target_user_id: userId });
      if (error) throw error;
      fetchUsers();
    } catch (error: any) {
      alert(`Error deleting user: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">User <span className="text-accent">Management</span></h1>
            <p className="text-gray-500 font-medium">Monitor user accounts, adjust balances, and manage security levels.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text"
            placeholder="Search accounts..."
            className="pl-10 pr-4 py-3 bg-navy-light/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent w-full md:w-80 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-navy-light/40 border border-white/5 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Accounts...</div>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
             <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
             <div className="text-white font-bold mb-2">Fetch Error</div>
             <div className="text-gray-500 text-xs mb-6 max-w-md mx-auto">{error}</div>
             <button onClick={() => fetchUsers()} className="px-6 py-2 bg-accent text-white rounded-xl font-bold text-sm">Retry Connection</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-navy/50 border-b border-white/5 text-gray-500">
                <tr>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Identitiy</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Permission</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Equity</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Verification</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px] text-right">Protection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className={`hover:bg-white/5 transition-colors group ${u.is_suspended ? 'opacity-50 grayscale' : ''}`}>
                    <td className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${u.is_suspended ? 'bg-gray-800' : 'bg-gradient-to-br from-navy-light to-navy border border-white/5'}`}>
                           {u.full_name?.[0] || <UserIcon className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                             <div className="font-bold text-white group-hover:text-accent transition-colors">{u.full_name || 'Anonymous'}</div>
                             {u.is_trading_suspended && <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase rounded border border-orange-500/20">Restricted</span>}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => toggleUserRole(u.id, u.role)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          u.role === 'admin' ? 'bg-accent/10 text-accent border border-accent/20 shadow-lg shadow-accent/20' : 
                          u.role === 'user' ? 'bg-white/10 text-gray-300' : 'bg-accent/10 text-accent border border-accent/20'
                        }`}
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="p-6 font-mono font-bold text-white text-lg">
                      ${u.wallets?.[0]?.balance?.toLocaleString() ?? '0.00'}
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Tier: {u.tier || 'Standard'}</div>
                    </td>
                    <td className="p-6">
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        u.kyc_status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                        u.kyc_status === 'under_review' ? 'bg-orange-500/10 text-orange-500' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {u.kyc_status?.replace('_', ' ') || 'Not Started'}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setHistoryUser(u);
                          setHistoryType('trades');
                        }}
                        className="w-9 h-9 bg-accent/10 text-accent rounded-xl hover:bg-accent hover:text-white transition-all inline-flex items-center justify-center shadow-lg"
                        title="View Trades"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setHistoryUser(u);
                          setHistoryType('transactions');
                        }}
                        className="w-9 h-9 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all inline-flex items-center justify-center shadow-lg"
                        title="View Transactions"
                      >
                        <UserIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingUser(u);
                          setEditBalance(u.wallets?.[0]?.balance || '0');
                        }}
                        className="w-9 h-9 bg-white/5 text-gray-400 rounded-xl hover:bg-white hover:text-navy transition-all inline-flex items-center justify-center shadow-lg"
                        title="Edit Balance"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleTradingSuspension(u.id, !!u.is_trading_suspended)}
                        className={`w-9 h-9 rounded-xl transition-all inline-flex items-center justify-center shadow-lg ${
                          u.is_trading_suspended ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
                        }`}
                        title={u.is_trading_suspended ? 'Enable Trading' : 'Disable Trading'}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleSuspension(u.id, !!u.is_suspended)}
                        className={`w-9 h-9 rounded-xl transition-all inline-flex items-center justify-center shadow-lg ${
                          u.is_suspended ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                        }`}
                        title={u.is_suspended ? 'Activate User' : 'Suspend User'}
                      >
                        {u.is_suspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.full_name || u.email)}
                        className="w-9 h-9 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all inline-flex items-center justify-center shadow-lg"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-bold">No accounts match your criteria.</p>
                      <p className="text-xs">Ensure users exist in the database or try a different search term.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-xl">
          <div className="bg-navy-light border border-white/5 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
             
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Edit <span className="text-accent">Balance</span></h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleUpdateBalance} className="space-y-6 relative z-10">
              <div className="p-4 bg-navy/50 rounded-2xl border border-white/5">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Target Account</label>
                <div className="text-white font-bold">{editingUser.full_name}</div>
                <div className="text-xs text-gray-500 font-mono">{editingUser.email}</div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Adjust Available Equity (USD)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-bold font-mono">$</span>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-4 py-4 bg-navy/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent font-mono font-bold text-lg"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                  <button type="button" onClick={() => setEditingUser(null)} className="py-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-2xl transition-all">Cancel</button>
                  <button type="submit" className="py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-2xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Update</span>
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyType && historyUser && (
        <UserHistoryModal 
          userId={historyUser.id}
          userName={historyUser.full_name || historyUser.email}
          type={historyType}
          onClose={() => {
            setHistoryType(null);
            setHistoryUser(null);
          }}
        />
      )}
    </div>
  );
};
