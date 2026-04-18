import { useState, useEffect } from 'react';
import { useTradingStore, type Asset } from '../store/tradingStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { Star, TrendingUp, TrendingDown, Search, ArrowRight } from 'lucide-react';


export const WatchlistPage = () => {
  const { livePrices, setSelectedAsset, watchlist, fetchWatchlist, removeFromWatchlist } = useTradingStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    if (user) {
      fetchWatchlist(user.id);
    }
    
    const channel = supabase.channel('watchlist-page-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'watchlists', filter: `user_id=eq.${user?.id}` },
        () => {
          if (user) fetchWatchlist(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchWatchlist]);

  const filteredAssets = watchlist.filter(a => 
    (a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 h-full flex flex-col space-y-8 overflow-y-auto hide-scrollbar">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide mb-2">My Watchlist</h1>
          <p className="text-gray-400">Track and monitor your favorite assets in real-time.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search watchlist..." 
            className="w-full pl-10 pr-4 py-3 bg-navy-light/40 border border-white/5 rounded-2xl focus:outline-none focus:border-accent text-white font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 bg-navy-light/40 border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col">
        <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAssets.map(asset => {
                const lp = livePrices[asset.symbol] || asset.basePrice;
                const change = lp - asset.basePrice;
                const changePercent = (change / asset.basePrice) * 100;
                const isPositive = change >= 0;
                const sparkline = [lp*0.98, lp*1.02, lp*0.99, lp*1.01, lp*1.03, lp*0.97, lp*1.02, lp*1, lp*1.01, lp];

                return (
                  <div key={asset.symbol} className="bg-navy/40 border border-white/5 hover:border-white/20 p-6 rounded-3xl shadow-lg transition-all group relative overflow-hidden">
                     {/* Gradient Glow */}
                     <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] pointer-events-none transition-colors ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}></div>

                     <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center space-x-4">
                         <button 
                            onClick={() => { if (user) removeFromWatchlist(user.id, asset.symbol); }}
                            className="text-accent hover:scale-110 transition-transform"
                          >
                           <Star fill="currentColor" className="w-6 h-6" />
                         </button>
                         <div>
                           <h3 className="text-xl font-black text-white">{asset.symbol}</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{asset.name}</p>
                         </div>
                       </div>
                       <button onClick={() => setSelectedAsset(asset as Asset)} className="w-10 h-10 rounded-full bg-navy border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-accent group-hover:border-accent/30 transition-all">
                         <ArrowRight className="w-4 h-4" />
                       </button>
                     </div>

                     <div className="flex items-end justify-between">
                       <div>
                         <p className="text-3xl font-mono font-bold text-white leading-none">
                           ${lp.toLocaleString(undefined, { minimumFractionDigits: lp > 1000 ? 2 : 4 })}
                         </p>
                         <p className={`mt-2 flex items-center font-bold text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                           {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                           {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                         </p>
                       </div>
                       
                       <div className="w-24 h-12 opacity-60 group-hover:opacity-100 transition-opacity">
                         <Sparklines data={sparkline} margin={0}>
                           <SparklinesLine color={isPositive ? '#10B981' : '#EF4444'} style={{ fill: 'none', strokeWidth: 3 }} />
                         </Sparklines>
                       </div>
                     </div>
                  </div>
                )
              })}

              {filteredAssets.length === 0 && !search && (
                <div className="col-span-full py-20 text-center text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold">Your watchlist is empty.</p>
                  <p className="text-xs">Add assets from the dashboard or search above.</p>
                </div>
              )}
           </div>
        </div>
      </div>
      
    </div>
  );
};

