import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, Phone, Clock, CheckCircle2, AlertCircle, 
  Search, Filter, ChevronRight, Loader2,
  User, Calendar, RefreshCw
} from 'lucide-react';
import { 
  fetchAllTickets, fetchAllCallbacks, updateCallbackRequest,
  type SupportTicket, type CallbackRequest 
} from '../../lib/supportService';
import { supabase } from '../../lib/supabase';

const TICKET_STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  open: { color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', icon: AlertCircle, label: 'Open' },
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', icon: Clock, label: 'Awaiting' },
  resolved: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: CheckCircle2, label: 'Resolved' },
  closed: { color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30', icon: CheckCircle2, label: 'Closed' },
};

const CALLBACK_STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Pending' },
  scheduled: { color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', label: 'Scheduled' },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'Completed' },
  cancelled: { color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30', label: 'Cancelled' },
};

export const AdminSupportPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tickets' | 'callbacks'>('tickets');
  const [tickets, setTickets] = useState<(SupportTicket & { user_email?: string; user_name?: string })[]>([]);
  const [callbacks, setCallbacks] = useState<(CallbackRequest & { user_email?: string; user_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tickets') {
        const data = await fetchAllTickets();
        if (data.length > 0) {
          // Fetch user info for tickets
          const userIds = [...new Set(data.map(t => t.user_id))];
          const { data: userData } = await supabase.from('users').select('id, email, full_name').in('id', userIds);
          const usersMap = Object.fromEntries(userData?.map(u => [u.id, u]) || []);
          
          setTickets(data.map(t => ({
            ...t,
            user_email: usersMap[t.user_id]?.email,
            user_name: usersMap[t.user_id]?.full_name
          })));
        } else {
          setTickets([]);
        }
      } else {
        const data = await fetchAllCallbacks();
        if (data.length > 0) {
          // Fetch user info for callbacks
          const userIds = [...new Set(data.map(c => c.user_id))];
          const { data: userData } = await supabase.from('users').select('id, email, full_name').in('id', userIds);
          const usersMap = Object.fromEntries(userData?.map(u => [u.id, u]) || []);

          setCallbacks(data.map(c => ({
            ...c,
            user_email: usersMap[c.user_id]?.email,
            user_name: usersMap[c.user_id]?.full_name
          })));
        } else {
          setCallbacks([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpdateCallback = async (id: string, status: string) => {
    try {
      await updateCallbackRequest(id, status);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCallbacks = callbacks.filter(c => {
    const matchesSearch = c.phone_number.includes(searchQuery) || 
                          c.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 pt-2 space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">Support Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage user tickets and callback requests.</p>
        </div>
        <button 
          onClick={loadData}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-accent"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-navy-light/20 p-1 rounded-2xl w-fit">
        <button
          onClick={() => { setActiveTab('tickets'); setStatusFilter('all'); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
            activeTab === 'tickets' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Tickets</span>
        </button>
        <button
          onClick={() => { setActiveTab('callbacks'); setStatusFilter('all'); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
            activeTab === 'callbacks' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Callbacks</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-navy-light/40 border border-white/5 p-4 rounded-3xl">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'tickets' ? "Search by subject, user, or email..." : "Search by phone, user, or email..."}
            className="w-full bg-navy/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/40 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy/40 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 transition-all appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="all">All Status</option>
            {activeTab === 'tickets' ? (
              <>
                <option value="open">Open</option>
                <option value="pending">Awaiting</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : activeTab === 'tickets' ? (
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-20 bg-navy-light/20 rounded-3xl border border-dashed border-white/10">
                <Ticket className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const sc = TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG.open;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => navigate(`/admin/support/tickets/${ticket.id}`)}
                    className="w-full bg-navy-light/40 border border-white/5 hover:border-accent/30 p-5 rounded-3xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-start space-x-4 min-w-0">
                      <div className={`p-3 rounded-2xl ${sc.bg} border shrink-0`}>
                        <sc.icon className={`w-5 h-5 ${sc.color}`} />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-base font-bold text-white truncate">{ticket.subject}</h3>
                          {ticket.priority === 'urgent' && <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Urgent</span>}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <User className="w-3.5 h-3.5" />
                            <span className="text-gray-300 font-medium">{ticket.user_name || 'Unknown'}</span>
                          </span>
                          <span>•</span>
                          <span>{ticket.user_email}</span>
                          <span>•</span>
                          <span className="capitalize">{ticket.category}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2 uppercase font-black tracking-widest">{formatDate(ticket.updated_at)}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCallbacks.length === 0 ? (
              <div className="text-center py-20 bg-navy-light/20 rounded-3xl border border-dashed border-white/10">
                <Phone className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No callback requests</p>
              </div>
            ) : (
              filteredCallbacks.map(cb => {
                const sc = CALLBACK_STATUS_CONFIG[cb.status] || CALLBACK_STATUS_CONFIG.pending;
                return (
                  <div
                    key={cb.id}
                    className="bg-navy-light/40 border border-white/5 p-5 rounded-3xl flex items-center justify-between transition-all"
                  >
                    <div className="flex items-start space-x-4 min-w-0">
                      <div className={`p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 shrink-0`}>
                        <Phone className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-black text-white">{cb.phone_number}</h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <User className="w-3.5 h-3.5" />
                            <span className="text-gray-300 font-medium">{cb.user_name || 'Unknown'}</span>
                          </span>
                          <span>•</span>
                          <span>{cb.user_email}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="flex items-center space-x-1 text-xs text-accent">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-bold">{cb.preferred_time}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-xs text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Requested: {formatDate(cb.created_at)}</span>
                          </span>
                        </div>
                        {cb.reason && (
                          <div className="mt-3 bg-navy/40 rounded-xl p-3 border border-white/5">
                            <p className="text-xs text-gray-400 italic">"{cb.reason}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                       {cb.status === 'pending' && (
                         <button 
                           onClick={() => handleUpdateCallback(cb.id, 'scheduled')}
                           className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-blue-500/20 transition-all"
                         >
                           Schedule
                         </button>
                       )}
                       {cb.status !== 'completed' && cb.status !== 'cancelled' && (
                         <button 
                           onClick={() => handleUpdateCallback(cb.id, 'completed')}
                           className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-emerald-500/20 transition-all"
                         >
                           Complete
                         </button>
                       )}
                       {cb.status === 'completed' && (
                         <div className="flex items-center space-x-1 text-emerald-400 px-4">
                           <CheckCircle2 className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Done</span>
                         </div>
                       )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
