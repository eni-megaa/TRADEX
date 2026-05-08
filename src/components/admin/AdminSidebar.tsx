import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Wallet, Activity, 
  Database, ShieldCheck, Settings, LogOut, 
  MessageSquare, FileText, CreditCard, BookOpen,
  Headphones
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const AdminSidebar = () => {
  const { signOut } = useAuthStore();

  const menuGroups = [
    {
      title: 'ANALYTICS',
      items: [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Wallet, label: 'Deposits', path: '/admin/deposits' },
        { icon: Activity, label: 'Withdrawals', path: '/admin/withdrawals' },
        { icon: ShieldCheck, label: 'KYC Verification', path: '/admin/kyc' },
        { icon: Headphones, label: 'Support Control', path: '/admin/support' },
      ],
    },
    {
      title: 'FINANCE & LEDGER',
      items: [
        { icon: CreditCard, label: 'Payment Providers', path: '/admin/providers' },
        { icon: BookOpen, label: 'General Ledger', path: '/admin/ledger' },
      ],
    },
    {
      title: 'TRADING & ASSETS',
      items: [
        { icon: Database, label: 'Trading Control', path: '/admin/trades' },
        { icon: Activity, label: 'Asset Management', path: '/admin/assets' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { icon: MessageSquare, label: 'Notifications', path: '/admin/notifications' },
        { icon: Settings, label: 'Platform Settings', path: '/admin/settings' },
        { icon: FileText, label: 'Audit Logs', path: '/admin/logs' },
      ]
    }
  ];

  // All admins see all menu items
  const filteredGroups = menuGroups;

  return (
    <div className="w-64 bg-navy border-r border-white/5 flex flex-col h-full sticky top-0 shrink-0">
      <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-3">
          <div>
            <span className="text-xl font-black tracking-widest block leading-none bg-clip-text">
              TRADE<span className="text-accent">X</span>
            </span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1 block">
              Admin Dashboard
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8 flex flex-col custom-scrollbar">
        {filteredGroups.map((group, idx) => (
          <div key={idx} className="mb-8 px-4">
            <h3 className="text-[10px] font-bold text-gray-500 tracking-widest mb-4 px-4 uppercase">
              {group.title}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                      isActive
                        ? 'bg-accent/15 text-accent font-bold shadow-[inset_4px_0_0_0_rgba(176,107,255,1)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${window.location.pathname === item.path ? 'text-accent' : ''}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-white/5 shrink-0 bg-navy-dark/30">
        <button
          onClick={() => signOut()}
          className="flex items-center justify-center space-x-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 w-full px-4 py-4 rounded-2xl font-bold transition-all border border-transparent hover:border-red-400/20"
        >
          <LogOut className="w-5 h-5" />
          <span>Signout</span>
        </button>
      </div>
    </div>
  );
};
