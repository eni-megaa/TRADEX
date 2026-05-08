import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, PieChart, Wallet, Activity, 
  History, Lightbulb, LineChart, TrendingUp, 
  Users, HelpCircle, Settings, LogOut, Plus, ShieldCheck 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { ManageServicesModal } from './ManageServicesModal';

export const Sidebar = () => {
  const { signOut, profile } = useAuthStore();
  const { enabledServices, initRealtimeSettings } = useSidebarStore();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Determine if user is admin
  const isAdmin = profile?.role === 'admin';

  // Initialize real-time global settings on load
  useEffect(() => {
    initRealtimeSettings();
  }, [initRealtimeSettings]);

  type MenuItem = { icon: any, label: string, path: string, badge?: string, alwaysOn?: boolean };
  type MenuGroup = { title: string, items: MenuItem[] };

  const rawMenuGroups: MenuGroup[] = [
    {
      title: 'MENU',
      items: [
        { icon: Home, label: 'Overview', path: '/dashboard' },
        { icon: PieChart, label: 'Portfolio', path: '/dashboard/portfolio' },
        { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
      ]
    },
    {
      title: 'MARKETS',
      items: [
        { icon: Activity, label: 'Trade', path: '/dashboard/trade' },
        { icon: History, label: 'Transactions', path: '/dashboard/transactions' },
        { icon: Lightbulb, label: 'Insights', path: '/dashboard/insights' },
        { icon: LineChart, label: 'Analytics', path: '/dashboard/analytics', badge: 'Beta' },
        { icon: TrendingUp, label: 'Market Trends', path: '/dashboard/trends' },
        { icon: Users, label: 'Copy Trading', path: '/dashboard/copy-trading', badge: 'NEW' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { icon: ShieldCheck, label: 'Verification', path: '/dashboard/kyc', alwaysOn: true },
        { icon: HelpCircle, label: 'Support', path: '/dashboard/support' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
      ]
    }
  ];

  const menuGroups = rawMenuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.alwaysOn || enabledServices.includes(item.label))
  })).filter(group => group.items.length > 0);

  return (
    <div className="w-64 bg-navy border-r border-white/5 flex flex-col h-full sticky top-0 shrink-0">
      <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-black text-white tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            TRADE<span className="text-accent">X</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-8 px-4">
            <h3 className="text-[10px] font-bold text-gray-500 tracking-widest mb-3 px-4 uppercase">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                      isActive
                        ? 'bg-accent/15 text-accent font-bold shadow-[inset_4px_0_0_0_rgba(176,107,255,1)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.badge === 'NEW' 
                        ? 'bg-accent text-white shadow-[0_0_10px_rgba(176,107,255,0.5)]' 
                        : 'bg-white/10 text-gray-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div className="mt-auto px-8 mb-4">
            <button 
              onClick={() => setIsManageModalOpen(true)}
              className="flex items-center space-x-3 text-xs font-bold text-gray-500 hover:text-accent transition-colors group"
            >
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent/20 group-hover:text-accent transition-all">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Manage Services</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-white/5 shrink-0">
        <button
          onClick={() => signOut()}
          className="flex items-center justify-center space-x-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 w-full px-4 py-2 rounded-xl text-sm font-bold transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Account</span>
        </button>
      </div>

      <ManageServicesModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
      />
    </div>
  );
};

