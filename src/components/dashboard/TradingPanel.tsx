import { useState, useEffect, useRef } from 'react';
import { useTradingStore, type Asset } from '../../store/tradingStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { ChevronDown, AlertCircle, Search } from 'lucide-react';
import { useKYCGuard } from '../../hooks/useKYCGuard';

export const TradingPanel = () => {
  const { selectedAsset, livePrices, assets, setSelectedAsset, balance, fetchBalance, addTrade, fetchAssets, searchAssets, searchResults } = useTradingStore();
  const { user } = useAuthStore();
  
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [lotSize, setLotSize] = useState('1.0');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  
  const [loading, setLoading] = useState(false);
  const { checkAccess } = useKYCGuard();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPrice = livePrices[selectedAsset.symbol] || selectedAsset.basePrice;
  const spread = (currentPrice * 0.0002).toFixed(4);
  const requiredMargin = (currentPrice * parseFloat(lotSize || '0') * 0.05).toFixed(2); // 20x leverage
  const fee = (currentPrice * parseFloat(lotSize || '0') * 0.001).toFixed(2); // 0.1% fee

  useEffect(() => {
    if (user) {
      fetchBalance(user.id);
    }
    
    if (assets.length === 0) {
      fetchAssets();
    }

    const channel = supabase.channel('wallet-changes-trade')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user?.id}` }, () => {
        if (user) fetchBalance(user.id);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchBalance, assets.length, fetchAssets]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTrade = async () => {
    if (!user) return alert('Please login first');
    const totalCost = parseFloat(requiredMargin) + parseFloat(fee);
    
    const { profile } = useAuthStore.getState();
    if (profile?.is_trading_suspended) {
      return alert('Trading is currently suspended for your account. Please contact support.');
    }

    if (balance < totalCost) {
      return alert('Insufficient balance for margin + fee. Required: $' + totalCost.toFixed(2));
    }

    setLoading(true);
    const executePrice = orderType === 'Market' ? currentPrice : parseFloat(limitPrice);

    try {
      // Deduct cost and Add trade through store
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: balance - totalCost })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      await addTrade(user.id, {
        symbol: selectedAsset.symbol,
        side: side,
        type: orderType,
        lotSize: parseFloat(lotSize),
        price: executePrice,
        ...(stopLoss && { stopLoss: parseFloat(stopLoss) }),
        ...(takeProfit && { takeProfit: parseFloat(takeProfit) }),
      } as any);

      setLotSize('1.0');
      setStopLoss('');
      setTakeProfit('');
      // Balance will be updated via fetchBalance or realtime trigger
    } catch (error: any) {
      alert('Trade execution failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const handler = setTimeout(() => {
      searchAssets(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, searchAssets]);

  const searchedAssets = searchResults;

  return (
    <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-4 flex flex-col relative z-20 shrink-0">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-base font-bold text-white tracking-wide">Execution</h3>
        
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-navy px-3 py-1.5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all text-sm font-bold"
          >
            {selectedAsset.logoid && (
              <img src={`https://s3-symbol-logo.tradingview.com/${selectedAsset.logoid}.svg`} alt={selectedAsset.symbol} className="w-4 h-4 object-contain rounded-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            )}
            <span>{selectedAsset.symbol}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-navy border border-white/5 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-2 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search asset..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-navy-light/50 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto hide-scrollbar">
                {searchedAssets.map(asset => (
                  <div 
                    key={asset.symbol} 
                    className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm transition-colors border-l-2 border-transparent hover:border-accent flex items-center space-x-3"
                    onClick={() => {
                      setSelectedAsset(asset as Asset);
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    {asset.logoid ? (
                      <img src={`https://s3-symbol-logo.tradingview.com/${asset.logoid}.svg`} alt={asset.symbol} className="w-5 h-5 object-contain rounded-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className="w-5 h-5 rounded-sm bg-navy-light flex items-center justify-center text-[10px] font-bold text-gray-500">{asset.symbol[0]}</div>
                    )}
                    <div>
                      <div className="font-bold text-white">{asset.symbol}</div>
                      <div className="text-xs text-gray-500">{asset.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex bg-navy p-1 rounded-2xl border border-white/5 mb-4 shrink-0 relative z-10">
        <div 
          onClick={() => setSide('Buy')}
          className={`cursor-pointer flex-1 py-2 text-center text-sm font-bold rounded-xl transition-all ${side === 'Buy' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-white'}`}
        >Buy</div>
        <div 
          onClick={() => setSide('Sell')}
          className={`cursor-pointer flex-1 py-2 text-center text-sm font-bold rounded-xl transition-all ${side === 'Sell' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-gray-500 hover:text-white'}`}
        >Sell</div>
      </div>

      <div className="flex space-x-4 mb-4 shrink-0 relative z-10">
        <button 
          onClick={() => setOrderType('Market')}
          className={`text-sm font-bold pb-2 border-b-2 transition-colors ${orderType === 'Market' ? 'border-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >Market</button>
        <button 
          onClick={() => setOrderType('Limit')}
          className={`text-sm font-bold pb-2 border-b-2 transition-colors ${orderType === 'Limit' ? 'border-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >Limit</button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto hide-scrollbar relative z-10">
        <div>
          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Quote Price</label>
          {orderType === 'Market' ? (
            <div className="w-full bg-navy/80 border border-white/5 rounded-2xl p-4 text-white font-mono text-center font-bold">
              Market Execution
            </div>
          ) : (
            <input 
              type="number" 
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={(currentPrice || 0).toString()}
              className="w-full bg-navy/80 border border-white/5 rounded-2xl p-4 text-white font-mono font-bold focus:outline-none focus:border-accent/50"
            />
          )}
        </div>

         <div>
           <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Lot Size / Quantity</label>
           <div className="relative">
             <input 
               type="number" 
               value={lotSize}
               onChange={(e) => setLotSize(e.target.value)}
               className="w-full bg-navy/80 border border-white/5 rounded-2xl p-4 text-white font-mono font-bold focus:outline-none focus:border-accent/50"
             />
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
               {selectedAsset.type === 'Forex' ? 'Lots' : selectedAsset.symbol.replace('USDT', '')}
             </span>
           </div>
        </div>

         <div>
           <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2 flex items-center gap-1">
             Stop Loss <AlertCircle className="w-3 h-3 text-accent" />
           </label>
           <div className="relative">
             <input 
               type="number" 
               value={stopLoss}
               onChange={(e) => setStopLoss(e.target.value)}
               placeholder="Optional"
               className="w-full bg-navy/80 border border-white/5 rounded-2xl p-4 text-white font-mono font-bold focus:outline-none focus:border-red-500/50"
             />
           </div>
        </div>

        <div>
           <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2 flex items-center gap-1">
             Take Profit <AlertCircle className="w-3 h-3 text-accent" />
           </label>
           <div className="relative">
             <input 
               type="number" 
               value={takeProfit}
               onChange={(e) => setTakeProfit(e.target.value)}
               placeholder="Optional"
               className="w-full bg-navy/80 border border-white/5 rounded-2xl p-4 text-white font-mono font-bold focus:outline-none focus:border-green-500/50"
             />
           </div>
        </div>

        <div className="text-right mt-2 mb-2">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available Balance: </span>
          <span className="font-mono text-white text-xs font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>

        </div>

        <div className="bg-navy/40 rounded-2xl p-4 space-y-3 mt-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Spread</span>
            <span className="font-mono text-white">{spread}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 flex items-center gap-1">Est. Fee <AlertCircle className="w-3 h-3"/></span>
            <span className="font-mono text-white">${fee}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Margin Required</span>
            <span className="font-mono text-accent font-bold">${requiredMargin}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => checkAccess(handleTrade)}
        disabled={loading}
        className={`w-full py-3 rounded-2xl font-bold text-white uppercase tracking-wider mt-3 shrink-0 shadow-lg transition-all hover:-translate-y-1 relative z-10 ${
          loading ? 'opacity-50 cursor-not-allowed' :
          side === 'Buy' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-green-500/20' 
            : 'bg-gradient-to-r from-red-500 to-rose-400 shadow-red-500/20'
        }`}
      >
        {loading ? 'Processing...' : `Execute ${side}`}
      </button>
    </div>
  );
};
