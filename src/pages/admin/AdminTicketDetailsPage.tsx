import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Loader2, Clock, CheckCircle2, 
  AlertCircle, User, ShieldCheck, Info,
  CheckCircle, XCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { 
  fetchTicketById, fetchTicketMessages, sendTicketMessage, 
  updateTicketStatus, type SupportTicket, type SupportMessage 
} from '../../lib/supportService';
import { supabase } from '../../lib/supabase';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  open: { color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', icon: AlertCircle, label: 'Open' },
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', icon: Clock, label: 'Awaiting User' },
  resolved: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: CheckCircle2, label: 'Resolved' },
  closed: { color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30', icon: CheckCircle2, label: 'Closed' },
};

export const AdminTicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<(SupportTicket & { user_email?: string; user_name?: string }) | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [t, m] = await Promise.all([fetchTicketById(id), fetchTicketMessages(id)]);
      
      if (t) {
        const { data: userData } = await supabase.from('users').select('email, full_name').eq('id', t.user_id).single();
        setTicket({ ...t, user_email: userData?.email, user_name: userData?.full_name });
      }
      setMessages(m);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!user || !id || !newMessage.trim() || sending) return;
    setSending(true);
    try {
      await sendTicketMessage(id, user.id, newMessage, true);
      setNewMessage('');
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      await updateTicketStatus(id, newStatus);
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setUpdating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-sm font-bold text-gray-400">Ticket not found</p>
        <button onClick={() => navigate('/admin/support')} className="text-accent text-xs mt-2 hover:underline">Go Back</button>
      </div>
    );
  }

  const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = sc.icon;

  return (
    <div className="min-h-full flex flex-col bg-navy-dark/20 pb-12">
      {/* Header */}
      <div className="shrink-0 border-b border-white/5 p-6 bg-navy/40">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 min-w-0">
            <button 
              onClick={() => navigate('/admin/support')} 
              className="p-2.5 hover:bg-white/5 rounded-2xl transition-colors mt-1 shrink-0 border border-white/5"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-white tracking-tight truncate mb-2">{ticket.subject}</h1>
              <div className="flex items-center flex-wrap gap-3">
                <span className={`inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{sc.label}</span>
                </span>
                <span className="flex items-center space-x-1 text-xs text-gray-400">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-bold text-gray-300">{ticket.user_name || 'User'}</span>
                  <span>({ticket.user_email})</span>
                </span>
                <span className="text-xs text-gray-500 px-2 py-0.5 bg-white/5 rounded-lg border border-white/5 capitalize">{ticket.category}</span>
                <span className="text-[10px] text-gray-600 font-bold bg-white/5 px-2 py-0.5 rounded-lg">ID: {ticket.id.slice(0, 13)}...</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {ticket.status !== 'resolved' && (
              <button
                disabled={updating}
                onClick={() => handleStatusUpdate('resolved')}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-emerald-500/20 transition-all flex items-center space-x-2"
              >
                {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>Resolve</span>
              </button>
            )}
            {ticket.status !== 'closed' && (
              <button
                disabled={updating}
                onClick={() => handleStatusUpdate('closed')}
                className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-white/5 transition-all flex items-center space-x-2"
              >
                {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Close</span>
              </button>
            )}
            {(ticket.status === 'resolved' || ticket.status === 'closed') && (
              <button
                disabled={updating}
                onClick={() => handleStatusUpdate('open')}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-blue-500/20 transition-all"
              >
                Reopen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.is_admin;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] sm:max-w-[70%] group`}>
                <div className={`flex items-center space-x-2 mb-1.5 ${isMe ? 'justify-end' : ''}`}>
                  {!isMe && (
                    <div className="w-6 h-6 rounded-lg bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/20">
                      <User className="w-3.5 h-3.5 text-accent-cyan" />
                    </div>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {isMe ? 'Internal Agent' : ticket.user_name || 'User'}
                  </span>
                  {isMe && (
                    <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    </div>
                  )}
                </div>
                <div
                  className={`px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
                    isMe
                      ? 'bg-accent/15 border border-accent/30 text-white rounded-tr-none'
                      : 'bg-navy-light/60 border border-white/5 text-gray-300 rounded-tl-none'
                  }`}
                >
                  {msg.message}
                </div>
                <p className={`text-[10px] font-bold text-gray-600 mt-2 px-1 ${isMe ? 'text-right' : ''}`}>{formatTime(msg.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/5 p-4 bg-navy/40">
        <div className="max-w-4xl mx-auto flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your response to the user..."
              className="w-full bg-navy-light/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/40 resize-none max-h-40 transition-all shadow-inner"
              style={{ minHeight: '56px' }}
            />
            <div className="absolute right-4 bottom-4 flex items-center space-x-2 pointer-events-none">
               <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-navy/60 px-2 py-0.5 rounded">Enter to send</span>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all shadow-xl shadow-accent/20 shrink-0 border border-accent/30"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center space-x-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
           <span className="flex items-center space-x-1">
             <ShieldCheck className="w-3 h-3" />
             <span>Admin Identity: Official TRADEX Support</span>
           </span>
           <span>•</span>
           <span className="flex items-center space-x-1">
             <Info className="w-3 h-3" />
             <span>User will receive in-app notification</span>
           </span>
        </div>
      </div>
    </div>
  );
};
