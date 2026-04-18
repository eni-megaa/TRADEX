import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useTradingStore } from '../../store/tradingStore';
import { X, Clock } from 'lucide-react';

export const LiveTrades = () => {
  const { user } = useAuthStore();
  const { livePrices, openTrades, closeTrade, fetchTrades, assets } = useTradingStore();
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [closedTrades, setClosedTrades] = useState<any[]>([]);
  const [closing, setClosing] = useState<string | null>(null);

  const fetchClosedTrades = async () => {

    if (!user) return;
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'CLOSED')
      .order('closed_at', { ascending: false })
      .limit(20);
    
    if (data) setClosedTrades(data);
  };

  useEffect(() => {
    if (user) {
      fetchTrades(user.id);
      if (activeTab === 'closed') fetchClosedTrades();
    }

    const channel = supabase.channel('livetrades-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${user?.id}` }, () => {
        if (user) {
          fetchTrades(user.id);
          if (activeTab === 'closed') fetchClosedTrades();
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeTab, fetchTrades]);

  const displayTrades = activeTab === 'open' ? openTrades : closedTrades;

  const getFloatingPnL = (trade: any) => {
    if (trade.status === 'CLOSED') return parseFloat(trade.pnl) || 0;
    const currentPrice = livePrices[trade.symbol] || parseFloat(trade.entry_price);
    const isBuy = trade.side === 'Buy' || trade.type === 'BUY';
    const entryPrice = trade.price || parseFloat(trade.entry_price);
    const amount = trade.lotSize || parseFloat(trade.amount);
    
    const diff = currentPrice - entryPrice;
    return isBuy ? diff * amount : -diff * amount;
  };

  const handleCloseTrade = async (trade: any) => {
    if (!user) return;
    setClosing(trade.id);
    const currentPrice = livePrices[trade.symbol] || trade.price || parseFloat(trade.entry_price);
    await closeTrade(trade.id, currentPrice);
    setClosing(null);
  };


  return (
    <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 flex flex-col mt-6 shrink-0 z-10 relative">
      <div className="flex space-x-4 mb-4 border-b border-white/5 pb-2 shrink-0">
         <button 
           onClick={() => setActiveTab('open')}
           className={`text-sm font-bold pb-2 border-b-2 -mb-[9px] transition-colors ${activeTab === 'open' ? 'border-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
         >
           Open Trades ({openTrades.length})
         </button>
         <button 
           onClick={() => setActiveTab('closed')}
           className={`text-sm font-bold pb-2 border-b-2 -mb-[9px] transition-colors ${activeTab === 'closed' ? 'border-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
         >
           Recent History
         </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar max-h-[500px]">
        {displayTrades.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            {activeTab === 'open' ? "You don't have any open trades." : "No recent trades found."}
          </div>
        ) : (
          displayTrades.map(trade => {
            const pnl = getFloatingPnL(trade);
            const isPositive = pnl >= 0;
            const assetInfo = assets.find((a: any) => a.symbol === trade.symbol);
            
            return (
              <div key={trade.id} className="bg-navy/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                         {trade.type}
                       </span>
                       <span className="font-bold text-white text-sm">{trade.symbol}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                       {trade.amount} {assetInfo?.type === 'Forex' ? 'Lots' : 'Units'} @ {parseFloat(trade.entry_price).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm font-bold flex items-center justify-end ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}${pnl.toFixed(2)}
                    </div>
                    {trade.status === 'OPEN' && (
                      <div className="text-[10px] text-gray-500 mt-1">
                        Current: {(livePrices[trade.symbol] || parseFloat(trade.entry_price)).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {trade.status === 'OPEN' ? (
                  <button
                    onClick={() => handleCloseTrade(trade)}
                    disabled={closing === trade.id}
                    className="w-full mt-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
                  >
                    {closing === trade.id ? <Clock className="w-3 h-3 animate-spin"/> : <X className="w-3 h-3"/>}
                    <span>Close Trade</span>
                  </button>
                ) : (
                  <div className="text-[10px] text-gray-500 mt-2 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Closed on {new Date(trade.closed_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
