import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  target: string;
  category?: string;
}

const STAFF_ROLES = ['admin', 'moderator', 'finance_manager', 'support_agent'];

export const ToastSystem = () => {
  const { user, profile } = useAuthStore();
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('public:notifications:toasts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const newNotif = payload.new as Notification;

        // Only toast for broadcast notifications, not admin_event ones
        if (newNotif.category === 'admin_event') return;

        // Only Warning and Urgent trigger toasts
        if (!['warning', 'urgent'].includes(newNotif.type)) return;

        // Admins don't see toast for their own broadcasts
        if (profile?.role && STAFF_ROLES.includes(profile.role)) return;

        // Filter by Target (matching current user context)
        let isTargeted = false;
        if (newNotif.target === 'all') isTargeted = true;
        if (newNotif.target === 'verified' && profile?.kyc_status === 'approved') isTargeted = true;
        if (newNotif.target === 'active') isTargeted = true;

        if (isTargeted) {
          showToast(newNotif);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, profile]);

  const showToast = (notif: Notification) => {
    setActiveToasts(prev => [...prev, notif]);
    
    // Auto-dismiss after 10 seconds for warnings
    if (notif.type === 'warning') {
      setTimeout(() => dismissToast(notif.id), 10000);
    }
    // Urgent stays until dismissed (or maybe 30 seconds?)
    if (notif.type === 'urgent') {
        setTimeout(() => dismissToast(notif.id), 30000);
    }
  };

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end space-y-4 pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`pointer-events-auto relative w-80 md:w-96 p-5 rounded-3xl border shadow-2xl overflow-hidden ${
                toast.type === 'urgent' 
                ? 'bg-red-500/20 border-red-500/30 backdrop-blur-xl' 
                : 'bg-orange-500/20 border-orange-500/30 backdrop-blur-xl'
            }`}
          >
             {/* Background Glow */}
             <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl ${
                 toast.type === 'urgent' ? 'bg-red-500/20' : 'bg-orange-500/20'
             }`}></div>

             <div className="flex items-start space-x-4 relative z-10">
                <div className={`p-3 rounded-2xl shrink-0 ${
                    toast.type === 'urgent' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                    {toast.type === 'urgent' ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{toast.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">{toast.message}</p>
                    
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">System Alert</span>
                        <button 
                            onClick={() => dismissToast(toast.id)}
                            className="text-[10px] font-black text-white uppercase tracking-widest hover:underline"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => dismissToast(toast.id)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
             </div>

             {/* Progress Bar (Auto-hide indicator) */}
             <motion.div 
               initial={{ scaleX: 1 }}
               animate={{ scaleX: 0 }}
               transition={{ duration: toast.type === 'urgent' ? 30 : 10, ease: 'linear' }}
               className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${
                   toast.type === 'urgent' ? 'bg-red-500' : 'bg-orange-500'
               }`}
             />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
