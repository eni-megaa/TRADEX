import { useState, useEffect } from 'react';
import { useTradingStore, type Asset } from '../../store/tradingStore';
import { Search, TrendingUp, TrendingDown, Trash2, Plus, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export const WatchlistPanel = () => {
  const { livePrices, assets, setSelectedAsset, watchlist, fetchWatchlist, addToWatchlist, removeFromWatchlist, fetchAssets, searchAssets, searchResults } = useTradingStore();
  const { user } = useAuthStore();
  
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (user) {
        await fetchWatchlist(user.id);
      }
      if (assets.length === 0) {
        await fetchAssets();
      }
      setLoading(false);
    };
    init();
    
    // Subscribe to realtime updates for this user's watchlist
    const channel = supabase.channel('watchlist-panel-sync')
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

  useEffect(() => {
    const handler = setTimeout(() => {
      searchAssets(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, searchAssets]);

  const searchedAssets = searchResults;

  const getDayChange = (symbol: string) => {
    const pseudoRand = (symbol.length * 2.5) % 8;
    const isPositive = symbol.charCodeAt(1) % 2 === 0;
    return { val: pseudoRand.toFixed(2), isPositive };
  };

  return (
    <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-4 h-full flex flex-col relative z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">My Watchlist</h2>
          <p className="text-xs text-gray-500">Track and manage your favorite assets</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto relative">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search assets to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent relative z-20"
            />
            {search && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-navy border border-white/5 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto hide-scrollbar">
                {searchedAssets.map(asset => {
                  const isAdded = watchlist.some(a => a.symbol === asset.symbol);
                  return (
                  <div key={asset.symbol} className="flex justify-between items-center p-3 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { 
                    if (user) {
                      if (isAdded) {
                        removeFromWatchlist(user.id, asset.symbol);
                      } else {
                        addToWatchlist(user.id, asset as Asset);
                        setSearch('');
                      }
                    } 
                  }}>
                    <div>
                      <span className="text-white font-bold block">{asset.name}</span>
                      <span className="text-xs text-gray-500">{asset.symbol} • {asset.type}</span>
                    </div>
                    {isAdded ? (
                      <Minus className="w-4 h-4 text-red-500" />
                    ) : (
                      <Plus className="w-4 h-4 text-accent" />
                    )}
                  </div>
                )})}
                {searchedAssets.length === 0 && (
                  <div className="p-3 text-sm text-gray-500 text-center">No assets found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto hide-scrollbar relative z-10 scroll-smooth">
        <div className="min-w-[550px] h-full flex flex-col">
          <div className="grid grid-cols-5 gap-4 px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 sticky top-0 bg-navy/80 backdrop-blur-sm z-20">
            <div className="col-span-2">Asset</div>
            <div>Live Price</div>
            <div>24h Change</div>
            <div className="text-right pr-2">Action</div>
          </div>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar mt-2 space-y-2 pb-4">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Loading watchlist...</div>
            ) : watchlist.length === 0 ? (
              <div className="text-center py-20 text-gray-500 flex flex-col items-center justify-center h-full">
                <Search className="w-12 h-12 mb-4 opacity-10" />
                <p>Your watchlist is empty.</p>
                <p className="text-[10px]">Search above to add assets.</p>
              </div>
            ) : (
              watchlist.map(asset => {
                const price = livePrices[asset.symbol] || asset.basePrice;
                const change = getDayChange(asset.symbol);
                
                return (
                  <div key={asset.symbol} className="grid grid-cols-5 gap-4 px-4 py-3 items-center bg-navy/30 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-2xl transition-all group">
                    <div className="col-span-2 flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedAsset(asset as Asset)}>
                       <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-navy-light to-navy border border-white/5 flex items-center justify-center font-bold text-white shadow-lg group-hover:shadow-accent/20 transition-all overflow-hidden p-1 shrink-0">
                         {asset.logoid ? (
                           <img src={`https://s3-symbol-logo.tradingview.com/${asset.logoid}.svg`} alt={asset.symbol} className="w-full h-full object-contain rounded-md" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = asset.symbol[0]; }} />
                         ) : (
                           asset.symbol[0]
                         )}
                       </div>
                       <div className="min-w-0">
                         <p className="text-white font-bold text-xs truncate group-hover:text-accent transition-colors">{asset.name}</p>
                         <div className="flex items-center space-x-2">
                           <span className="text-[10px] text-gray-500 font-bold">{asset.symbol}</span>
                           <span className="text-[8px] px-1 bg-white/5 rounded text-gray-400 uppercase hidden xs:inline">{asset.type}</span>
                         </div>
                       </div>
                    </div>
                    
                    <div className="font-mono text-white font-bold text-xs">
                      {(price || 0).toLocaleString('en-US', { minimumFractionDigits: (price || 0) > 1000 ? 2 : 4 })}
                    </div>
                    
                    <div className={`flex items-center font-bold text-xs ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {change.isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                      {change.val}%
                    </div>
                    
                    <div className="text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); if (user) removeFromWatchlist(user.id, asset.symbol); }}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

