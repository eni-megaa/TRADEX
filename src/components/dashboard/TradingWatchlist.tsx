import { useState, useEffect } from 'react';
import { useTradingStore, type Asset } from '../../store/tradingStore';
import { Search, TrendingUp, TrendingDown, Trash2, Plus, Minus, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const TradingWatchlist = () => {
  const { 
    livePrices, 
    livePriceChanges,
    setSelectedAsset, 
    selectedAsset,
    watchlist, 
    fetchWatchlist, 
    addToWatchlist, 
    removeFromWatchlist, 
    searchAssets, 
    searchResults 
  } = useTradingStore();
  const { user } = useAuthStore();
  

  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWatchlist(user.id);
    }
  }, [user, fetchWatchlist]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search) {
        searchAssets(search);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [search, searchAssets]);

  const handleSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsSearching(false);
    setSearch('');
  };

  return (
    <div className="flex flex-col h-full border-l overflow-hidden bg-bg-dark border-white/5">
      {/* Search Header */}
      <div className="p-4 border-b border-white/5 bg-navy/40">
        <div className="relative group">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? 'text-accent' : 'text-gray-500'}`} />
          <input 
            type="text"
            placeholder="Search assets..."
            value={search}
            onFocus={() => setIsSearching(true)}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl py-2 pl-10 pr-4 text-xs placeholder:text-gray-400 focus:outline-none focus:border-accent/50 transition-all font-medium bg-navy-light/30 border-white/5 text-white focus:bg-navy-light/50"
          />
          {isSearching && (
            <button 
              onClick={() => { setIsSearching(false); setSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar relative">
        {isSearching ? (
          <div className="absolute inset-0 z-50 overflow-y-auto p-2 space-y-1 bg-navy/95">
            <p className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-widest">Search Results</p>
            {searchResults.map(asset => {
              const isAdded = watchlist.some(a => a.symbol === asset.symbol);
              return (
              <div 
                key={asset.symbol} 
                className="flex justify-between items-center p-3 rounded-xl transition-all cursor-pointer group hover:bg-white/5"
                onClick={() => handleSelect(asset)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border overflow-hidden group-hover:border-accent/30 transition-colors bg-navy border-white/5">
                    {asset.logoid ? (
                      <img src={`https://s3-symbol-logo.tradingview.com/${asset.logoid}.svg`} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500">{asset.symbol[0]}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold block leading-tight text-white">{asset.symbol}</span>
                    <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">{asset.name}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (user) {
                      if (isAdded) {
                        removeFromWatchlist(user.id, asset.symbol);
                      } else {
                        addToWatchlist(user.id, asset);
                        setIsSearching(false);
                        setSearch('');
                      }
                    } 
                  }}
                  className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                    isAdded 
                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                      : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
                  }`}
                >
                  {isAdded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            )})}
            {!search && (
              <div className="text-center py-10 opacity-30">
                <Search className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xs text-white">Type to search market assets</p>
              </div>
            )}
          </div>
        ) : null}

        <div className="p-2 space-y-1">
          <p className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-widest">Watchlist</p>
          
          {watchlist.length === 0 ? (
            <div className="text-center py-20 opacity-20">
              <p className="text-xs text-white">Your watchlist is empty</p>
            </div>
          ) : (
            watchlist.map(asset => {
              const price = livePrices[asset.symbol] || asset.basePrice;
              const change = livePriceChanges[asset.symbol] || 0;
              const isSelected = selectedAsset.symbol === asset.symbol;
              
              return (
                <div 
                  key={asset.symbol} 
                  className={`flex justify-between items-center p-3 rounded-xl transition-all cursor-pointer group relative overflow-hidden ${
                    isSelected 
                      ? 'bg-accent/10 border border-accent/20' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  onClick={() => setSelectedAsset(asset)}
                >
                  {/* Selection Indicator */}
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border overflow-hidden transition-colors bg-navy border-white/5">
                      {asset.logoid ? (
                        <img src={`https://s3-symbol-logo.tradingview.com/${asset.logoid}.svg`} alt="" className="w-5 h-5 object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-500">{asset.symbol[0]}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold block leading-tight text-white">{asset.symbol}</span>
                      <span className="text-[10px] text-gray-500 block truncate max-w-[100px]">{asset.name}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-white">
                      {(price || 0).toLocaleString('en-US', { minimumFractionDigits: (price || 0) > 1000 ? 2 : 4 })}
                    </div>
                    <div className={`flex items-center justify-end font-bold text-[10px] ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(change).toFixed(2)}%
                    </div>
                  </div>

                  {/* Quick Remove (Mobile/Hover) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (user) removeFromWatchlist(user.id, asset.symbol); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
