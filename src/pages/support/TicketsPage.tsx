import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Ticket, CheckCircle2, AlertCircle, ChevronRight, Loader2, ArrowLeft, Search, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { fetchUserTickets, createTicket, type SupportTicket } from '../../lib/supportService';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  open: { color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', icon: AlertCircle, label: 'Open' },
  pending: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: CheckCircle2, label: 'Reply Received' },
  resolved: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: CheckCircle2, label: 'Resolved' },
  closed: { color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30', icon: CheckCircle2, label: 'Closed' },
};

const CATEGORIES = ['general', 'account', 'trading', 'deposit', 'withdrawal', 'technical', 'other'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export const TicketsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchUserTickets(user.id);
      setTickets(data);
    } catch (e) {
      console.error(e);
      setFormError(e instanceof Error ? e.message : 'Failed to load support tickets.');
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !subject.trim() || !message.trim()) return;
    setCreating(true);
    setFormError(null);
    try {
      const ticket = await createTicket(user.id, subject, category, priority, message);
      setShowForm(false);
      setSubject('');
      setCategory('general');
      setPriority('normal');
      setMessage('');
      navigate(`/dashboard/support/tickets/${ticket.id}`);
    } catch (e) {
      console.error(e);
      setFormError(e instanceof Error ? e.message : 'Failed to submit ticket. Please try again.');
    }
    setCreating(false);
  };

  const filtered = tickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (showForm) {
    return (
      <div className="p-4 pt-1 h-full flex flex-col overflow-hidden">
        <div className="flex items-center space-x-3 shrink-0 py-1 mb-3">
          <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </button>
          <div>
            <h1 className="text-base font-black text-white tracking-tight leading-none uppercase">New Ticket</h1>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">Describe your issue in detail.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pb-4">
          <div className="bg-navy-light/40 border border-white/5 rounded-2xl p-5 space-y-4">
            {formError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400">
                {formError}
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Unable to withdraw funds"
                className="w-full bg-navy/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-navy/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-navy">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-navy/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
                >
                  {PRIORITIES.map(p => <option key={p} value={p} className="bg-navy">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Describe Your Issue</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Please provide as much detail as possible..."
                className="w-full bg-navy/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all resize-none"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || !subject.trim() || !message.trim()}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-accent/20 transition-all text-xs flex items-center justify-center space-x-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Ticket className="w-4 h-4" /><span>Submit Ticket</span></>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-1 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between shrink-0 py-1 mb-3">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/dashboard/support')} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </button>
          <div>
            <h1 className="text-base font-black text-white tracking-tight leading-none uppercase">My Tickets</h1>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">{tickets.length} total ticket{tickets.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-accent hover:bg-accent-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center space-x-2 mb-3 shrink-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets..."
            className="w-full bg-navy-light/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-accent/30 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-navy-light/40 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-accent/30 transition-all"
          >
            <option value="all" className="bg-navy">All Status</option>
            <option value="open" className="bg-navy">Open</option>
            <option value="pending" className="bg-navy">Reply Received</option>
            <option value="resolved" className="bg-navy">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Ticket className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm font-bold text-gray-400">No tickets found</p>
            <p className="text-xs text-gray-600 mt-1">Create a new ticket to get started.</p>
          </div>
        ) : (
          filtered.map(ticket => {
            const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const StatusIcon = sc.icon;
            return (
              <button
                key={ticket.id}
                onClick={() => navigate(`/dashboard/support/tickets/${ticket.id}`)}
                className="w-full bg-navy-light/40 border border-white/5 hover:border-white/15 rounded-2xl p-4 flex items-center justify-between group transition-all hover:bg-white/[0.03]"
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div className={`p-2 rounded-xl ${sc.bg} border shrink-0 mt-0.5`}>
                    <StatusIcon className={`w-4 h-4 ${sc.color}`} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold text-white truncate">{ticket.subject}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] text-gray-500 capitalize bg-white/5 px-2 py-0.5 rounded-full">{ticket.category}</span>
                      <span className="text-[10px] text-gray-500">{formatDate(ticket.updated_at)}</span>
                      {ticket.priority === 'urgent' && <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-bold">Urgent</span>}
                      {ticket.priority === 'high' && <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-bold">High</span>}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
