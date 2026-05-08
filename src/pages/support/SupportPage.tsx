import { HeadphonesIcon, MessageCircle, FileText, Mail, Loader2, CheckCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { sendSupportRequestNotification } from '../../lib/adminNotifications';

export const SupportPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSupportClick = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await sendSupportRequestNotification(
        profile?.full_name || user.email || 'Unknown User',
        user.email || 'No Email',
        'Direct chat request from Support page'
      );
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  return (
    <div className="p-4 pt-1 h-full flex flex-col space-y-2 overflow-hidden">
      
      <div className="flex items-center justify-between shrink-0 py-1">
        <div className="flex items-baseline space-x-3">
          <h1 className="text-base font-black text-white tracking-tight leading-none uppercase">Support</h1>
          <p className="text-[10px] text-gray-500 leading-none">24/7 priority assistance for TRADEX members.</p>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Contact Options */}
        <div className="space-y-4 overflow-y-auto hide-scrollbar">
          <div className="bg-gradient-to-br from-accent/20 to-accent-cyan/20 border border-accent/30 rounded-3xl p-6 hover:scale-[1.01] transition-transform cursor-pointer shadow-lg shadow-accent/10">
            <MessageCircle className="w-8 h-8 text-accent mb-3" />
            <h3 className="text-xl font-black text-white mb-1">Live Chat</h3>
            <p className="text-sm text-gray-300 font-medium mb-4">Connect with a trading specialist. Wait time: <span className="text-white font-bold">&lt; 2 mins</span></p>
            <button 
              onClick={handleSupportClick}
              disabled={loading || sent}
              className={`w-full font-black tracking-widest uppercase py-2.5 rounded-xl shadow-xl transition-all text-xs flex items-center justify-center space-x-2 ${
                sent ? 'bg-green-500 text-white' : 'bg-accent hover:bg-accent-hover text-white'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <><CheckCircle className="w-4 h-4" /> <span>Request Sent</span></> : <span>Start Conversation</span>}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Support → Tickets */}
            <button
              onClick={() => navigate('/dashboard/support/tickets')}
              className="bg-navy-light/40 border border-white/5 p-4 rounded-3xl hover:bg-white/5 hover:border-white/15 transition-all cursor-pointer group text-left w-full"
            >
              <div className="flex items-start justify-between">
                <Mail className="w-5 h-5 text-accent-cyan mb-2 group-hover:scale-110 transition-transform" />
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-accent-cyan group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Email Support</h4>
              <p className="text-[10px] text-gray-500">Open & manage support tickets.</p>
            </button>
            
            {/* Phone Call → Callback */}
            <button
              onClick={() => navigate('/dashboard/support/callback')}
              className="bg-navy-light/40 border border-white/5 p-4 rounded-3xl hover:bg-white/5 hover:border-white/15 transition-all cursor-pointer group text-left w-full"
            >
              <div className="flex items-start justify-between">
                <HeadphonesIcon className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Phone Call</h4>
              <p className="text-[10px] text-gray-500">Schedule a callback.</p>
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-navy-light/40 border border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/5 bg-navy/20 shrink-0 flex items-center">
            <FileText className="w-4 h-4 text-accent mr-2" />
            <h2 className="text-base font-black text-white tracking-wide">Frequently Asked Questions</h2>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
            <div className="bg-navy/40 border border-white/5 p-4 rounded-2xl hover:border-white/20 transition-colors">
              <h4 className="font-bold text-white text-xs mb-1">How do I withdraw?</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">Select "Withdraw", input the amount and destination. Process takes 2-4 hours.</p>
            </div>
            <div className="bg-navy/40 border border-white/5 p-4 rounded-2xl hover:border-white/20 transition-colors">
              <h4 className="font-bold text-white text-xs mb-1">What is Copy Trading?</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">Choose a pro to mirror their entry, stop-loss, and take-profit targets proportionally.</p>
            </div>
            <div className="bg-navy/40 border border-white/5 p-4 rounded-2xl hover:border-white/20 transition-colors">
              <h4 className="font-bold text-white text-xs mb-1">Maintenance Margin?</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">Minimum equity to keep positions open. For 500x, it's 50% of bound margin.</p>
            </div>
            <div className="bg-navy/40 border border-white/5 p-4 rounded-2xl hover:border-white/20 transition-colors">
               <h4 className="font-bold text-white text-xs mb-1">Asset Security?</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed">Assets stored in 1:1 cold storage with multi-sig technology.</p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};
