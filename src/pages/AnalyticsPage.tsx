import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { TrendingUp, TrendingDown, Target, CheckCircle2 } from 'lucide-react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

export const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    winRate: 0,
    profitFactor: 0,
    totalTrades: 0,
    maxDrawdown: 0,
    equityCurve: [10000, 10000], // Default flat curve or wallet balance start
    assetDistribution: { crypto: 0, forex: 0, stocks: 0 },
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      try {
        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id);
          
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (trades && wallet) {
          const closedTrades = trades.filter(t => t.status.toLowerCase() === 'closed');
          
          let wins = 0;
          let grossProfit = 0;
          let grossLoss = 0;
          let cryptoCount = 0;
          let forexCount = 0;
          let stockCount = 0;
          
          let runningEquity = wallet.balance - closedTrades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
          const equityCurve: number[] = [runningEquity];
          let peak = runningEquity;
          let maxDrawdownRaw = 0;

          // For distribution, count all trades
          trades.forEach(t => {
             // simplified grouping, adjust based on true asset data if needed
             if (t.asset.includes('USDT') || t.asset === 'BTC' || t.asset === 'ETH') cryptoCount++;
             else if (t.asset.length === 6) forexCount++; // e.g., EURUSD
             else stockCount++;
          });

          // Sort closed trades by time to build equity curve
          closedTrades.sort((a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime());

          closedTrades.forEach(t => {
            const pnl = parseFloat(t.pnl) || 0;
            if (pnl > 0) {
              wins++;
              grossProfit += pnl;
            } else if (pnl < 0) {
              grossLoss += Math.abs(pnl);
            }
            
            runningEquity += pnl;
            equityCurve.push(runningEquity);
            
            if (runningEquity > peak) {
              peak = runningEquity;
            } else if (peak > 0) {
              const dropdown = (peak - runningEquity) / peak;
              if (dropdown > maxDrawdownRaw) maxDrawdownRaw = dropdown;
            }
          });

          const totalClosed = closedTrades.length;
          const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;
          const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? grossProfit : 0);
          
          const totalDist = trades.length || 1;
          
          setMetrics({
            winRate,
            profitFactor,
            totalTrades: trades.length,
            maxDrawdown: maxDrawdownRaw * 100,
            equityCurve: equityCurve.length > 1 ? equityCurve : [wallet.balance, wallet.balance],
            assetDistribution: {
              crypto: (cryptoCount / totalDist) * 100,
              forex: (forexCount / totalDist) * 100,
              stocks: (stockCount / totalDist) * 100,
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 h-full flex items-center justify-center">
        <div className="text-white text-lg animate-pulse tracking-widest font-bold">CALCULATING METRICS...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 h-full flex flex-col space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide mb-2">Performance Analytics</h1>
          <p className="text-gray-400">Deep-dive into your trading history, win rates, and risk management metrics.</p>
        </div>
        <button className="bg-navy-light/40 border border-white/5 text-gray-300 px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:border-white/20 transition-all">
          Generate Tax Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
         {/* Metric Cards */}
         <div className="bg-navy-light/40 border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col relative overflow-hidden group hover:border-accent/30 transition-colors">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Win Rate</span>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-mono font-black text-white">{metrics.winRate.toFixed(1)}%</span>
              {metrics.winRate >= 50 ? <TrendingUp className="w-5 h-5 text-green-500 mb-1" /> : <TrendingDown className="w-5 h-5 text-red-500 mb-1" />}
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-24 h-24 translate-x-4 translate-y-4" />
            </div>
         </div>

         <div className="bg-navy-light/40 border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col relative overflow-hidden group hover:border-accent/30 transition-colors">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Profit Factor</span>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-mono font-black text-white">{metrics.profitFactor.toFixed(2)}</span>
            </div>
            {metrics.profitFactor > 1.5 ? (
              <p className="text-[10px] text-green-500 mt-2 font-bold uppercase">Highly Profitable</p>
            ) : metrics.profitFactor > 1 ? (
              <p className="text-[10px] text-yellow-500 mt-2 font-bold uppercase">Profitable</p>
            ) : (
              <p className="text-[10px] text-red-500 mt-2 font-bold uppercase">Needs Improvement</p>
            )}
         </div>

         <div className="bg-navy-light/40 border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col relative overflow-hidden group hover:border-accent/30 transition-colors">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Max Drawdown</span>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-mono font-black text-white">{metrics.maxDrawdown.toFixed(1)}%</span>
              <TrendingDown className="w-5 h-5 text-red-500 mb-1" />
            </div>
            {metrics.maxDrawdown > 20 ? (
              <p className="text-[10px] text-orange-500 mt-2 font-bold uppercase">High Risk Region</p>
            ) : (
              <p className="text-[10px] text-green-500 mt-2 font-bold uppercase">Well Managed</p>
            )}
         </div>

         <div className="bg-navy-light/40 border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col relative overflow-hidden group hover:border-accent/30 transition-colors">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Total Trades</span>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-mono font-black text-white">{metrics.totalTrades}</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase">All Time</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Equity Curve Chart */}
        <div className="lg:col-span-2 bg-navy-light/40 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-lg font-bold text-white tracking-wide">Account Growth</h3>
            <div className="flex items-center space-x-4 text-xs font-bold text-gray-500">
              <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-accent mr-2"></div> Net Equity</span>
            </div>
          </div>
          <div className="flex-1 opacity-80 pt-10">
            <Sparklines data={metrics.equityCurve} margin={0} height={100}>
              <SparklinesLine color="#B06BFF" style={{ strokeWidth: 3, fillOpacity: 0.1 }} />
            </Sparklines>
          </div>
        </div>

        {/* Trade Distribution */}
        <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col space-y-6">
           <div>
             <h3 className="text-lg font-bold text-white tracking-wide mb-6">Asset Distribution</h3>
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white">Crypto</span>
                    <span className="text-gray-400">{metrics.assetDistribution.crypto.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-navy rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all" style={{ width: `${metrics.assetDistribution.crypto}%` }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white">Forex</span>
                    <span className="text-gray-400">{metrics.assetDistribution.forex.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-navy rounded-full overflow-hidden">
                    <div className="h-full bg-accent-cyan transition-all" style={{ width: `${metrics.assetDistribution.forex}%` }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white">Stocks</span>
                    <span className="text-gray-400">{metrics.assetDistribution.stocks.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-navy rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all" style={{ width: `${metrics.assetDistribution.stocks}%` }}></div>
                  </div>
               </div>
             </div>
           </div>

           <div className="flex-1 bg-navy/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-center items-center text-center">
             <CheckCircle2 className="w-10 h-10 text-green-500 mb-3 opacity-50" />
             <h4 className="text-sm font-bold text-white mb-1">Live Analytics Active</h4>
             <p className="text-xs text-gray-500">Your trading metrics are calculated directly from your order history.</p>
           </div>
        </div>
      </div>

    </div>
  );
};
