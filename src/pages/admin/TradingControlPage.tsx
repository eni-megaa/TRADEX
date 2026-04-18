import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTradingStore } from '../../store/tradingStore';
import { Activity, XCircle, Search, ShieldAlert, AlertCircle } from 'lucide-react';

export const TradingControlPage = () => {
  const { livePrices } = useTradingStore();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTrades();
    const channel = supabase.channel('admin-trades-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => fetchTrades())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*, users(email, full_name)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setTrades(data);
    }
    setLoading(false);
  };

  const closeTradeByAdmin = async (trade: any, reason: string = 'Administrative Closure') => {
    const currentPrice = livePrices[trade.symbol] || trade.entry_price;
    const isBuy = trade.type === 'buy';
    const pnl = isBuy 
      ? (currentPrice - trade.entry_price) * (trade.amount / trade.entry_price)
      : (trade.entry_price - currentPrice) * (trade.amount / trade.entry_price);

    try {
      // 1. Close the trade
      await supabase
        .from('trades')
        .update({ 
          status: 'closed', 
          exit_price: currentPrice, 
          pnl: pnl,
          closed_at: new Date().toISOString(),
          closed_by_admin: true,
          closing_reason: reason
        })
        .eq('id', trade.id);

      // 2. Return margin + PNL to user wallet
      const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', trade.user_id).single();
      if (wallet) {
        await supabase
          .from('wallets')
          .update({ balance: Number(wallet.balance) + trade.amount + pnl })
          .eq('user_id', trade.user_id);
      }

      // 3. Log the action
      await supabase.from('audit_logs').insert([{
        action: 'Force Close Trade',
        user_id: trade.user_id,
        details: { trade_id: trade.id, symbol: trade.symbol, pnl, reason }
      }]);

      fetchTrades();
    } catch (error) {
      console.error('Error closing trade:', error);
    }
  };

  const filteredTrades = trades.filter(t => 
    t.users?.email?.toLowerCase().includes(search.toLowerCase()) || 
    t.symbol?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Trading <span className="text-accent">Terminal</span></h1>
            <p className="text-gray-500 font-medium">Monitor all live positions and intercept high-risk exposure.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="Find users or symbols..."
                className="pl-10 pr-4 py-3 bg-navy-light/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent w-full md:w-64 transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Live Positions Table */}
        <div className="xl:col-span-3">
          <div className="bg-navy-light/40 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 bg-navy/50 flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Global Live Orderbook</h3>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-500 uppercase">Real-time Feed</span>
                </div>
            </div>

            {loading ? (
                <div className="p-20 text-center text-gray-400">Syncing trades...</div>
            ) : filteredTrades.length === 0 ? (
                <div className="p-20 text-center text-gray-500">
                    <Activity className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="font-bold text-lg text-white/20 uppercase tracking-tighter">No Active Positions</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-navy/30 text-gray-500">
                            <tr>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Contract</th>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">User Account</th>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Side</th>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">PnL (Live)</th>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px] text-right">Intervention</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTrades.map((trade) => {
                                const lp = livePrices[trade.symbol] || trade.entry_price;
                                const isBuy = trade.type === 'buy';
                                const currentPnL = isBuy 
                                  ? (lp - trade.entry_price) * (trade.amount / trade.entry_price)
                                  : (trade.entry_price - lp) * (trade.amount / trade.entry_price);
                                const isPositive = currentPnL >= 0;

                                return (
                                    <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="font-bold text-white group-hover:text-accent transition-colors">{trade.symbol}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">Entry: ${trade.entry_price.toLocaleString()}</div>
                                        </td>
                                        <td className="p-6 text-xs">
                                            <div className="text-white font-medium">{trade.users?.full_name}</div>
                                            <div className="text-gray-500 font-mono opacity-50">{trade.users?.email}</div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${isBuy ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {trade.type}
                                            </span>
                                        </td>
                                        <td className="p-6 font-mono">
                                            <div className={`text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                                {isPositive ? '+' : ''}{currentPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">Margin: ${trade.amount.toLocaleString()}</div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button 
                                                onClick={() => closeTradeByAdmin(trade)}
                                                className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all inline-flex items-center justify-center shadow-lg hover:shadow-red-500/20"
                                                title="Force Close"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="xl:col-span-1 space-y-6">
            <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" /> Risk <span className="text-red-500 ml-1">Metrics</span>
                </h3>
                <div className="space-y-6">
                    <div className="p-4 bg-navy/50 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Open Margin</p>
                        <p className="text-2xl font-mono font-bold text-white">${trades.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-navy/50 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Aggregate PnL</p>
                        {(() => {
                            const totalPnL = trades.reduce((sum, trade) => {
                                const lp = livePrices[trade.symbol] || trade.entry_price;
                                return sum + (trade.type === 'buy' ? (lp - trade.entry_price) : (trade.entry_price - lp)) * (trade.amount / trade.entry_price);
                            }, 0);
                            return <p className={`text-2xl font-mono font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        })()}
                    </div>
                </div>
            </div>

            <div className="bg-navy-light/40 border border-red-500/20 rounded-3xl p-8 shadow-xl">
                <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">Emergency Protocol</h3>
                <p className="text-xs text-gray-500 mb-6">Administrators can override any position. Actions are logged and irreversible.</p>
                <div className="space-y-3">
                    <button className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all flex items-center justify-center space-x-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Suspend All Trading</span>
                    </button>
                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-2xl transition-all border border-white/5">
                        Close All High Risk Orders
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
