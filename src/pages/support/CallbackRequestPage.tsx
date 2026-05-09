import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Clock, Loader2, CheckCircle, Calendar, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { createCallbackRequest, fetchUserCallbacks, type CallbackRequest } from '../../lib/supportService';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Pending' },
  scheduled: { color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', label: 'Scheduled' },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'Completed' },
  cancelled: { color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30', label: 'Cancelled' },
};

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '06:00 PM - 07:00 PM',
];

export const CallbackRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadCallbacks();
  }, [user]);

  const loadCallbacks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchUserCallbacks(user.id);
      setCallbacks(data);
    } catch (e) {
      console.error(e);
      setFormError(e instanceof Error ? e.message : 'Failed to load callback requests.');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user || !phone.trim() || !preferredTime) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await createCallbackRequest(user.id, phone, reason, preferredTime);
      setSubmitted(true);
      setShowForm(false);
      setPhone('');
      setReason('');
      setPreferredTime('');
      await loadCallbacks();
      setTimeout(() => setSubmitted(false), 4000);
    } catch (e) {
      console.error(e);
      setFormError(e instanceof Error ? e.message : 'Failed to request callback. Please try again.');
    }
    setSubmitting(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-4 pt-1 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 py-1 mb-3">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/dashboard/support')} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </button>
          <div>
            <h1 className="text-base font-black text-white tracking-tight leading-none uppercase">Schedule Callback</h1>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">Request a call from our support team.</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-accent hover:bg-accent-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-accent/20"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Request Call</span>
          </button>
        )}
      </div>

      {submitted && (
        <div className="shrink-0 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center space-x-3 mb-3 animate-pulse">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-400">Callback Scheduled</p>
            <p className="text-[10px] text-emerald-400/70">Our team will call you at your preferred time.</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pb-4">
        {/* New Request Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-5 space-y-4 animate-in">
            {formError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white flex items-center space-x-2">
                <Phone className="w-4 h-4 text-orange-400" />
                <span>New Callback Request</span>
              </h2>
              <button onClick={() => setShowForm(false)} className="text-[10px] text-gray-400 hover:text-white transition-colors">Cancel</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-navy/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Preferred Time</label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setPreferredTime(slot)}
                    className={`px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                      preferredTime === slot
                        ? 'bg-orange-500/20 border-orange-400/40 text-orange-300'
                        : 'bg-navy/40 border-white/5 text-gray-400 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Reason (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Brief description of what you need help with..."
                className="w-full bg-navy/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/30 transition-all resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !phone.trim() || !preferredTime}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-xs flex items-center justify-center space-x-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Calendar className="w-4 h-4" /><span>Confirm Request</span></>}
            </button>
          </div>
        )}

        {/* Past Requests */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Requests</h3>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
            </div>
          ) : callbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center bg-navy-light/20 border border-white/5 rounded-2xl">
              <Phone className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-xs text-gray-500">No callback requests yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {callbacks.map(cb => {
                const cs = STATUS_CONFIG[cb.status] || STATUS_CONFIG.pending;
                return (
                  <div key={cb.id} className="bg-navy-light/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <Phone className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-sm font-bold text-white">{cb.phone_number}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{cb.preferred_time}</span>
                          <span>•</span>
                          <span>{formatDate(cb.created_at)}</span>
                        </div>
                        {cb.reason && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{cb.reason}</p>}
                        {cb.admin_notes && (
                          <div className="mt-2 bg-accent/5 border border-accent/10 rounded-lg p-2">
                            <p className="text-[10px] font-bold text-accent mb-0.5 flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3" /><span>Admin Note</span>
                            </p>
                            <p className="text-[11px] text-gray-300">{cb.admin_notes}</p>
                          </div>
                        )}
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cs.bg} ${cs.color}`}>{cs.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
