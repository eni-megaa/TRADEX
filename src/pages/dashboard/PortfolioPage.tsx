import { useEffect, useState } from 'react';
import { useTradingStore } from '../../store/tradingStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { PieChart, TrendingUp, TrendingDown, DollarSign, Activity, Download } from 'lucide-react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

export const PortfolioPage = () => {
  const { openTrades, livePrices, balance, fetchBalance, fetchTrades } = useTradingStore();
  const { user } = useAuthStore();
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchBalance(user.id);
      fetchTrades(user.id);
    }
  }, [user, fetchBalance, fetchTrades]);

  // Calculate Unrealized PnL from open trades
  const unrealizedPnL = openTrades.reduce((acc, trade) => {
    const currentPrice = livePrices[trade.symbol] || trade.price;
    const pnl = trade.side === 'Buy' 
      ? (currentPrice - trade.price) * trade.lotSize
      : (trade.price - currentPrice) * trade.lotSize;
    return acc + pnl;
  }, 0);

  const totalEquity = balance + unrealizedPnL;
  const isPositive = unrealizedPnL >= 0;

  // Aggregate holdings from open trades
  const holdings = openTrades.reduce((acc, trade) => {
    const currentPrice = livePrices[trade.symbol] || trade.price;
    const value = trade.lotSize * currentPrice;
    const pnl = trade.side === 'Buy' 
      ? (currentPrice - trade.price) * trade.lotSize
      : (trade.price - currentPrice) * trade.lotSize;
      
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = { amount: 0, value: 0, pnl: 0, trades: 0 };
    }
    acc[trade.symbol].amount += trade.lotSize;
    acc[trade.symbol].value += value;
    acc[trade.symbol].pnl += pnl;
    acc[trade.symbol].trades += 1;
    return acc;
  }, {} as Record<string, { amount: number, value: number, pnl: number, trades: number }>);

  const holdingsList = Object.entries(holdings).map(([symbol, data]) => ({ symbol, ...data }));

  const downloadStatement = async () => {
    if (!user) return;
    setDownloading(true);
    
    const { data: allTrades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!allTrades || allTrades.length === 0) {
      alert('No trades found for this account.');
      setDownloading(false);
      return;
    }

    const headers = ['Symbol', 'Side', 'Amount', 'Entry Price', 'Status', 'PnL', 'Opened At', 'Closed At'];
    const csvContent = [
      headers.join(','),
      ...allTrades.map(t => [
        t.symbol,
        t.type,
        t.amount,
        t.entry_price,
        t.status,
        t.pnl || 0,
        t.created_at,
        t.closed_at || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `TRADEX_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloading(false);
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col space-y-4 overflow-y-auto hide-scrollbar">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide mb-1">Portfolio</h1>
          <p className="text-gray-400 text-sm">Track your asset allocation and performance securely.</p>
        </div>
        <button 
          onClick={downloadStatement}
          disabled={downloading}
          className="flex items-center space-x-2 bg-navy-light/50 border border-white/5 px-4 py-2 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-all disabled:opacity-50"
        >
          <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
          <span>{downloading ? 'Generating...' : 'Download Statement'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-navy-light to-navy border border-white/5 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="flex items-center space-x-2 mb-3 text-gray-400">
            <DollarSign className="w-4 h-4 text-accent" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">Total Equity</h3>
          </div>
          <p className="text-2xl font-mono font-bold text-white mb-1">${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {isPositive ? '+' : ''}${Math.abs(unrealizedPnL).toFixed(2)}
          </div>
        </div>

        {/* PnL Card */}
        <div className="bg-navy-light/40 border border-white/5 rounded-2xl p-4 shadow-xl relative">
          <div className="flex items-center space-x-2 mb-3 text-gray-400">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">Wallet Balance</h3>
          </div>
          <p className="text-2xl font-mono font-bold mb-1 text-white">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="h-8 mt-2 opacity-70">
            <Sparklines data={openTrades.length > 0 ? openTrades.map(t => t.pnl || 0) : [0, 0, 0, 0, 0]} margin={0}>
              <SparklinesLine color="#B06BFF" style={{ strokeWidth: 3 }} />
            </Sparklines>
          </div>
        </div>

        {/* Asset Allocation Chart */}
        <div className="bg-navy-light/40 border border-white/5 rounded-2xl p-4 shadow-xl flex items-center">
          <div className="flex-1">
             <div className="flex items-center space-x-2 mb-3 text-gray-400">
                <PieChart className="w-4 h-4 text-accent" />
                <h3 className="font-bold uppercase tracking-widest text-[10px]">Asset Distribution</h3>
             </div>
             <div className="space-y-3">
               {holdingsList.length === 0 ? (
                 <p className="text-xs text-gray-500">No active distributions.</p>
               ) : (
                 holdingsList.slice(0, 3).map((asset, i) => (
                   <div key={asset.symbol} className="flex justify-between items-center text-sm">
                     <div className="flex items-center">
                       <div className={`w-2 h-2 rounded-full mr-2 ${i === 0 ? 'bg-accent' : i === 1 ? 'bg-cyan-400' : 'bg-orange-400'}`}></div>
                       <span className="text-white">{asset.symbol}</span>
                     </div>
                     <span className="text-gray-400 font-mono text-xs">{((asset.value / totalEquity) * 100).toFixed(1)}%</span>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-navy-light/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[300px]">
        <div className="px-4 py-3 border-b border-white/5 bg-navy/20 shrink-0">
          <h2 className="font-bold text-white tracking-wide">Current Holdings</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
          {holdingsList.length > 0 ? (
            <div className="space-y-3">
              {holdingsList.map((asset) => (
                <div key={asset.symbol} className="bg-navy/40 border border-white/5 hover:border-white/10 p-3 rounded-xl flex items-center justify-between transition-all group">
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-navy-light to-navy border border-white/5 rounded-lg flex items-center justify-center text-lg font-bold shadow-lg">
                       {asset.symbol[0]}
                     </div>
                     <div>
                       <h4 className="text-white font-bold group-hover:text-accent transition-colors">{asset.symbol}</h4>
                       <p className="text-xs text-gray-500 font-bold">{asset.amount} Units / {asset.trades} Trades</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono font-bold">${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className={`text-xs font-bold font-mono ${asset.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.pnl >= 0 ? '+' : ''}{asset.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })} PnL
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <PieChart className="w-12 h-12 opacity-20" />
              <p className="font-medium">No open positions holding assets.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

