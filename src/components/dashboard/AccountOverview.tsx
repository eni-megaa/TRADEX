import { useTradingStore } from '../../store/tradingStore';
import { DollarSign, Briefcase, Activity } from 'lucide-react';

export const AccountOverview = () => {
  const { openTrades } = useTradingStore();

  const totalProfit = openTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const openPositionsCount = openTrades.length;
  // Calculating amount invested (simplified as lotSize * price, adjust if needed)
  const amountInvested = openTrades.reduce((sum, trade) => sum + (trade.lotSize * trade.price), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[120px] shrink-0">
      
      {/* Profit Box */}
      <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div>
          <p className="text-gray-400 text-sm font-bold mb-1">Unrealized Profit</p>
          <p className={`text-2xl font-bold font-mono tracking-wider ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalProfit >= 0 ? '+' : '-'}${Math.abs(totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${totalProfit >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      {/* Open Positions Box */}
      <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div>
          <p className="text-gray-400 text-sm font-bold mb-1">Open Positions</p>
          <p className="text-2xl font-bold font-mono text-white tracking-wider">
            {openPositionsCount}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* Amount Invested Box */}
      <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div>
          <p className="text-gray-400 text-sm font-bold mb-1">Amount Invested</p>
          <p className="text-2xl font-bold font-mono text-white tracking-wider">
            ${amountInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Briefcase className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
};
