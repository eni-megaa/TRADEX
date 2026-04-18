import { User as UserIcon, Wallet, Menu } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { useTradingStore } from '../../store/tradingStore';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ThemeToggle } from '../ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';

export const DashboardHeader = ({ isAdmin = false, onMenuOpen }: { isAdmin?: boolean, onMenuOpen: () => void }) => {
  const { user, profile } = useAuthStore();
  const { openTrades, fetchTrades } = useTradingStore();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadHeaderData = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setBalance(data.balance);
      }
      
      if (!isAdmin) {
        fetchTrades(user.id);
      }
    };
    loadHeaderData();
  }, [user, isAdmin, fetchTrades]);

  // Dynamic greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const firstName = profile?.full_name?.split(' ')[0] || profile?.username || user?.email?.split('@')[0] || 'User';

  // Format current date statically for display (e.g., Oct 23, 2026)
  const displayDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate live PNL and active trades
  const livePnL = openTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
  const activeTradesCount = openTrades.length;

  return (
    <header className="h-16 bg-navy border-b border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shrink-0">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuOpen}
        className="mr-4 p-2 text-gray-400 hover:text-white lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Integrated Welcome & Summary Section (replaces search bar) */}
      <div className="flex-1 flex items-center space-x-4 md:space-x-6 overflow-hidden">
        <div className="hidden sm:block shrink-0">
          <h2 className="text-base font-bold text-white tracking-wide leading-tight">
            Welcome Back, <span className="text-accent">{firstName}</span>
          </h2>
          <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">
            Trading summary {displayDate}
          </p>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
          <div className="bg-white/5 backdrop-blur-md px-2 md:px-3 py-1.5 rounded-xl border border-white/5 text-left transition-colors hover:bg-white/10 group">
            <p className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">{isAdmin ? 'Volume' : 'PNL'}</p>
            <p className={`${isAdmin ? 'text-white' : livePnL >= 0 ? 'text-green-500' : 'text-red-500'} font-bold font-mono text-[10px] md:text-xs group-hover:scale-105 transition-transform origin-left`}>
              {isAdmin ? '$12M' : `${livePnL >= 0 ? '+' : '-'}$${Math.abs(livePnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md px-2 md:px-3 py-1.5 rounded-xl border border-white/5 text-left transition-colors hover:bg-white/10 group hidden xs:block">
            <p className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">{isAdmin ? 'Health' : 'Active'}</p>
            <p className="text-white font-bold font-mono text-[10px] md:text-xs group-hover:scale-105 transition-transform origin-left">
              {isAdmin ? '99%' : activeTradesCount.toString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 md:space-x-6 ml-4">
        
        {/* Wallet Balance Summary (Hidden for Admin) */}
        {!isAdmin && (
          <div className="hidden lg:flex items-center space-x-3 bg-navy-light/50 px-4 py-2 rounded-2xl border border-white/5">
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/20">
              <Wallet className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Balance</p>
              <p className="text-white font-bold text-sm tracking-wide">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Action Icons */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <NotificationDropdown />
        </div>

        {/* Profile Section */}
        <button className="flex items-center space-x-3 pl-4 border-l border-white/10 group text-left">
          <div className="hidden md:block">
            <p className="text-[10px] text-gray-400 font-medium mb-0.5">{greeting}</p>
            <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">
              {firstName}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-hover border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-accent/30 transition-shadow">
            {profile?.avatar_url ? (
               <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <UserIcon className="w-5 h-5 text-white" />
            )}
          </div>
        </button>

      </div>
    </header>
  );
};
