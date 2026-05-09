import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, Send, Users, ShieldAlert, CheckCircle, Info, AlertTriangle, Clock, Trash2, History } from 'lucide-react';

interface BroadcastRecord {
  id: string;
  title: string;
  message: string;
  type: string;
  target: string;
  created_at: string;
}

export const NotificationsPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState<BroadcastRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all'
  });

  // Fetch users for specific targeting
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await supabase.from('users').select('id, full_name, email').not('email', 'is', null);
        if (data) setUsers(data);
      } catch (e) {
        console.error('Error fetching users:', e);
      }
    };
    fetchUsers();
  }, []);

  // Fetch broadcast history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('category', 'broadcast')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .is('user_id', null)
          .order('created_at', { ascending: false })
          .limit(50);
        setHistory(data || []);
      } catch (e) {
        console.error('Fallback also failed:', e);
      }
    }
    setHistoryLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (formData.target === 'specific') {
        if (selectedUserIds.length === 0) {
          alert('Please select at least one user.');
          setLoading(false);
          return;
        }

        // Insert individual direct notifications so users receive them
        const insertData = selectedUserIds.map(uid => ({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          target: 'specific',
          category: 'direct',
          user_id: uid
        }));
        await supabase.from('notifications').insert(insertData);

        // Insert one parent record for Admin Broadcast History (so they can see it in this dashboard)
        const { error } = await supabase.from('notifications').insert([{
          title: formData.title,
          message: formData.message,
          type: formData.type,
          target: 'specific',
          category: 'broadcast',
        }]);

        if (error) throw error;
      } else {
        // Standard broadcast
        const { error } = await supabase.from('notifications').insert([{
          title: formData.title,
          message: formData.message,
          type: formData.type,
          target: formData.target,
          category: 'broadcast',
        }]);
        if (error) throw error;
      }

      // Log in audit_logs as well
      await supabase.from('audit_logs').insert([{
        action: 'Broadcast Notification',
        details: { 
            ...formData,
            selectedUsersCount: selectedUserIds.length,
            sent_at: new Date().toISOString()
        }
      }]);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({ title: '', message: '', type: 'info', target: 'all' });
      setSelectedUserIds([]);
      fetchHistory(); // Refresh the history
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send broadcast. Make sure the database schema is updated.');
    }
    setLoading(false);
  };

  const handleDeleteBroadcast = async (id: string) => {
    if (!confirm('Delete this broadcast from history?')) return;
    try {
      await supabase.from('notifications').delete().eq('id', id);
      fetchHistory();
    } catch (error) {
      console.error('Error deleting broadcast:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-500 bg-blue-500/10';
      case 'warning': return 'text-orange-500 bg-orange-500/10';
      case 'urgent': return 'text-red-500 bg-red-500/10';
      case 'success': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'all': return 'Everyone';
      case 'active': return 'Active Traders';
      case 'verified': return 'KYC Verified';
      case 'admins': return 'Admin Staff';
      case 'specific': return 'Specific Users';
      default: return target;
    }
  };

  const [userSearchText, setUserSearchText] = useState('');
  
  // Handle user search filtering natively
  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(userSearchText.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(userSearchText.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">System <span className="text-accent">Broadcast</span></h1>
        <p className="text-gray-500 font-medium">Send real-time alerts and announcements to platform users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compose Form */}
        <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>

             <form onSubmit={handleSendNotification} className="space-y-5 relative z-10">
                <div>
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Message Title</label>
                   <input 
                     type="text"
                     required
                     className="w-full px-4 py-3.5 bg-navy/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent font-bold text-sm"
                     placeholder="e.g. Scheduled Maintenance"
                     value={formData.title}
                     onChange={(e) => setFormData({...formData, title: e.target.value})}
                   />
                </div>

                <div>
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Detailed Content</label>
                   <textarea 
                     required
                     rows={3}
                     className="w-full px-4 py-3.5 bg-navy/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent resize-none text-sm"
                     placeholder="Type your message here..."
                     value={formData.message}
                     onChange={(e) => setFormData({...formData, message: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Notification Type</label>
                        <select 
                            className="w-full px-4 py-3 bg-navy/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent appearance-none capitalize text-sm"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="info">Information</option>
                            <option value="warning">Warning</option>
                            <option value="urgent">Urgent Alert</option>
                            <option value="success">Success / Promo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Audience Target</label>
                        <select 
                            className="w-full px-4 py-3 bg-navy/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent appearance-none capitalize text-sm"
                            value={formData.target}
                            onChange={(e) => setFormData({...formData, target: e.target.value})}
                        >
                            <option value="all">Every User</option>
                            <option value="active">Active Traders</option>
                            <option value="verified">KYC Verified Only</option>
                            <option value="admins">Admin Staff Only</option>
                            <option value="specific">Specific Users</option>
                        </select>
                    </div>
                </div>

                {formData.target === 'specific' && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Users</label>
                      <span className="text-[10px] font-bold text-accent">{selectedUserIds.length} Selected</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search users by name or email..." 
                      className="w-full px-4 py-3 bg-navy/30 border border-white/5 rounded-xl text-white focus:outline-none focus:border-accent text-xs mb-2"
                      value={userSearchText}
                      onChange={(e) => setUserSearchText(e.target.value)}
                    />
                    <div className="max-h-48 overflow-y-auto border border-white/5 bg-navy/50 rounded-2xl p-2 space-y-1 custom-scrollbar">
                       {filteredUsers.map(u => (
                          <label key={u.id} className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/5">
                             <input 
                                type="checkbox" 
                                checked={selectedUserIds.includes(u.id)}
                                onChange={(e) => {
                                   if (e.target.checked) setSelectedUserIds([...selectedUserIds, u.id]);
                                   else setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                                }}
                                className="w-4 h-4 rounded border-gray-600 bg-navy text-accent focus:ring-accent focus:ring-offset-navy"
                             />
                             <div className="flex-1 min-w-0">
                               <p className="text-white text-xs font-bold truncate">{u.full_name || 'Unnamed User'}</p>
                               <p className="text-gray-500 text-[10px] truncate">{u.email}</p>
                             </div>
                          </label>
                       ))}
                       {filteredUsers.length === 0 && (
                         <div className="py-4 text-center text-xs text-gray-500">{users.length === 0 ? "No users exist." : "No users match search."}</div>
                       )}
                    </div>
                  </div>
                )}

                {/* Live Preview */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all"></div>
                    <div className="relative bg-navy/60 p-4 rounded-2xl border border-white/5 flex items-start space-x-3">
                        <div className={`p-2 rounded-xl shrink-0 ${getTypeColor(formData.type)}`}>
                            {formData.type === 'info' && <Info className="w-4 h-4" />}
                            {formData.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                            {formData.type === 'urgent' && <ShieldAlert className="w-4 h-4" />}
                            {formData.type === 'success' && <Bell className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-xs truncate">{formData.title || 'Preview Title'}</h4>
                            <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2 mt-0.5">{formData.message || 'Preview message content...'}</p>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || success}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
                        success ? 'bg-green-500 text-white' : 'bg-accent hover:bg-accent-hover text-white active:scale-95 shadow-accent/20'
                    }`}
                >
                    {loading ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : success ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Broadcast Sent!</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            <span>Transmit Broadcast</span>
                        </>
                    )}
                </button>
             </form>
        </div>

        {/* Broadcast History */}
        <div className="bg-navy-light/40 border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[650px]">
          <div className="p-5 border-b border-white/5 bg-navy/30 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <History className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Broadcast History</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{history.length} total</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {historyLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-10 h-10 mx-auto mb-3 text-white/5" />
                <p className="text-gray-500 text-xs font-medium">No broadcasts sent yet.</p>
                <p className="text-gray-600 text-[10px] mt-1">Send your first broadcast using the form.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {history.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-white/5 transition-colors group">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      </div>
                      <button 
                        onClick={() => handleDeleteBroadcast(item.id)}
                        className="p-1 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-1 mb-2">{item.message}</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-medium">
                          {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Users className="w-3 h-3" />
                        <span className="text-[9px] font-medium">{getTargetLabel(item.target)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
