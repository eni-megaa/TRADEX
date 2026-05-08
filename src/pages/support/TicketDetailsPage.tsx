import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle, User, ShieldCheck, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { fetchTicketById, fetchTicketMessages, sendTicketMessage, type SupportTicket, type SupportMessage } from '../../lib/supportService';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  open: { color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', icon: AlertCircle, label: 'Open' },
  pending: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: MessageSquare, label: 'Reply Received' },
  resolved: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: CheckCircle2, label: 'Resolved' },
  closed: { color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30', icon: CheckCircle2, label: 'Closed' },
};

export const TicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

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
      setTicket(t);
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
      await sendTicketMessage(id, user.id, newMessage, false);
      setNewMessage('');
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setSending(false);
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
        <button onClick={() => navigate('/dashboard/support/tickets')} className="text-accent text-xs mt-2 hover:underline">Go Back</button>
      </div>
    );
  }

  const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = sc.icon;
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-white/5 p-4 bg-navy/40">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 min-w-0">
            <button onClick={() => navigate('/dashboard/support/tickets')} className="p-2 hover:bg-white/5 rounded-xl transition-colors mt-0.5 shrink-0">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-white leading-tight truncate">{ticket.subject}</h1>
              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{sc.label}</span>
                </span>
                <span className="text-[10px] text-gray-500 capitalize bg-white/5 px-2 py-0.5 rounded-full">{ticket.category}</span>
                <span className="text-[10px] text-gray-600">#{ticket.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = !msg.is_admin;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] sm:max-w-[70%] group`}>
                <div className={`flex items-center space-x-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                  {!isMe && (
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-accent" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-gray-500">
                    {isMe ? 'You' : 'Support Agent'}
                  </span>
                  {isMe && (
                    <div className="w-5 h-5 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-accent-cyan" />
                    </div>
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-accent/15 border border-accent/20 text-gray-200 rounded-tr-sm'
                      : 'bg-navy-light/60 border border-white/5 text-gray-300 rounded-tl-sm'
                  }`}
                >
                  {msg.message}
                </div>
                <p className={`text-[10px] text-gray-600 mt-1 ${isMe ? 'text-right' : ''}`}>{formatTime(msg.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isClosed ? (
        <div className="shrink-0 border-t border-white/5 p-4 bg-navy/30 text-center">
          <p className="text-xs text-gray-500">This ticket has been {ticket.status}. <button onClick={() => navigate('/dashboard/support/tickets')} className="text-accent hover:underline">View all tickets</button></p>
        </div>
      ) : (
        <div className="shrink-0 border-t border-white/5 p-3 bg-navy/30">
          <div className="flex items-end space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your message..."
              className="flex-1 bg-navy-light/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/40 resize-none max-h-32 transition-all"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-accent/20 shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
