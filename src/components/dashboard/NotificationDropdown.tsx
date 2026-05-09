import { useState, useEffect, useRef } from 'react';
import { Bell, Info, AlertTriangle, ShieldAlert, CheckCircle, UserPlus, FileText, Wallet, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  target: string;
  category: string;
  created_at: string;
  is_read?: boolean;
}

const STAFF_ROLES = ['admin', 'moderator', 'finance_manager', 'support_agent'];

export const NotificationDropdown = () => {
  const { user, profile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = !!profile?.role && STAFF_ROLES.includes(profile.role);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Fetch notifications (RLS handles visibility)
      const { data: notifs, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (notifError) throw notifError;

      // Fetch read status
      const { data: reads, error: readError } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);

      if (readError) throw readError;

      const readIds = new Set(reads.map(r => r.notification_id));

      // Filter based on role
      const processedNotifs = (notifs || [])
        .filter(notif => {
          if (isAdmin) {
            // Admins see admin_event notifications only (not their own broadcasts)
            return notif.category === 'admin_event';
          } else {
            // Specific user notifications
            if (notif.category === 'direct') {
              return notif.user_id === user.id;
            }
            
            // Users see broadcasts only, filtered by target
            if (notif.category !== 'broadcast') return false;
            // Only show notifications created after the user's account
            if (user.created_at && new Date(notif.created_at) < new Date(user.created_at)) return false;
            if (notif.target === 'all') return true;
            if (notif.target === 'verified' && profile?.kyc_status === 'approved') return true;
            if (notif.target === 'active') return true;
            return false;
          }
        })
        .map(notif => ({
          ...notif,
          is_read: readIds.has(notif.id)
        }));

      setNotifications(processedNotifs);
      setUnreadCount(processedNotifs.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up Realtime subscription
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, profile]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_reads')
        .upsert({ 
          notification_id: notificationId, 
          user_id: user.id,
          read_at: new Date().toISOString()
        });

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('notification_reads')
        .upsert(unreadIds.map(id => ({
          notification_id: id,
          user_id: user.id,
          read_at: new Date().toISOString()
        })));

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeStyles = (type: string, category: string) => {
    // Admin event notifications have their own icon logic
    if (category === 'admin_event') {
      switch (type) {
        case 'new_user': return { bg: 'bg-accent/10', text: 'text-accent', icon: UserPlus };
        case 'kyc_submission': return { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: FileText };
        case 'deposit_request': return { bg: 'bg-green-500/10', text: 'text-green-500', icon: Wallet };
        case 'withdrawal_request': return { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: Wallet };
        case 'support_ticket': return { bg: 'bg-cyan-500/10', text: 'text-cyan-500', icon: MessageCircle };
        default: return { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: Info };
      }
    }
    // Broadcast notifications
    switch (type) {
      case 'info': return { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Info };
      case 'warning': return { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: AlertTriangle };
      case 'urgent': return { bg: 'bg-red-500/10', text: 'text-red-500', icon: ShieldAlert };
      case 'success': return { bg: 'bg-green-500/10', text: 'text-green-500', icon: CheckCircle };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: Info };
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-navy-light/40 border border-white/5 hover:bg-navy-light hover:border-white/10 transition-all text-gray-400 hover:text-white"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-navy shadow-[0_0_10px_rgba(176,107,255,0.6)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile overlay backdrop */}
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown panel — full-width on mobile, positioned on desktop */}
          <div className="fixed inset-x-0 bottom-0 top-auto max-h-[80vh] md:absolute md:inset-auto md:right-0 md:top-full md:mt-3 md:w-96 md:max-h-[500px] bg-navy/98 md:bg-navy/95 backdrop-blur-xl border-t md:border border-white/10 md:rounded-2xl shadow-2xl overflow-hidden z-50 md:rounded-b-2xl rounded-t-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAdmin ? 'Admin Alerts' : 'Notifications'}
                </h3>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  {unreadCount} unread {isAdmin ? 'alerts' : 'messages'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-accent hover:text-accent-hover transition-colors uppercase tracking-widest"
                  >
                    Mark all read
                  </button>
                )}
                {/* Close button for mobile */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(80vh - 120px)' }}>
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-xs font-medium">
                    {isAdmin ? 'No new platform alerts.' : 'All caught up! No new alerts.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => {
                    const styles = getTypeStyles(notif.type, notif.category);
                    const Icon = styles.icon;
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`p-4 flex items-start space-x-3 hover:bg-white/5 transition-colors cursor-pointer relative ${notif.is_read ? 'opacity-50' : ''}`}
                      >
                        {!notif.is_read && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent"></div>
                        )}
                        <div className={`p-2 rounded-xl shrink-0 ${styles.bg} ${styles.text}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`text-xs font-bold leading-tight truncate mr-2 ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[9px] text-gray-600 font-medium shrink-0 whitespace-nowrap">
                              {getRelativeTime(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white/5 border-t border-white/5 text-center shrink-0">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black uppercase text-gray-500 hover:text-white tracking-widest transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
