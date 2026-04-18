import { useState } from 'react';
import { useTradingStore } from '../../store/tradingStore';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

export const RecentAssets = () => {
  const { recentInteractions, livePrices, setSelectedAsset } = useTradingStore();
  const [tab, setTab] = useState<'Recent' | 'Gainers'>('Recent');

  const getPseudoChange = (symbol: string) => {
    const pseudoRand = (symbol.length * 3.14) % 15;
    const isPositive = symbol.charCodeAt(0) % 2 === 0;
    return { val: pseudoRand.toFixed(2), isPositive };
  };

  return (
    <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-4 flex flex-col h-[280px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-base font-bold text-white tracking-wide">Market Movers</h3>
        <div className="flex bg-navy p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setTab('Recent')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'Recent' ? 'bg-accent text-white shadow-[0_0_10px_rgba(176,107,255,0.4)]' : 'text-gray-500 hover:text-white'
            }`}
          >
            Recent
          </button>
          <button 
            onClick={() => setTab('Gainers')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'Gainers' ? 'bg-accent text-white shadow-[0_0_10px_rgba(176,107,255,0.4)]' : 'text-gray-500 hover:text-white'
            }`}
          >
            Top Gainers
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto hide-scrollbar flex space-x-4 pb-2">
        {recentInteractions.map((asset) => {
          const change = getPseudoChange(asset.symbol);
          const price = livePrices[asset.symbol] || asset.basePrice;
          
          return (
            <button 
              key={asset.symbol} 
              onClick={() => setSelectedAsset(asset)}
              className="min-w-[200px] flex-1 bg-navy/60 border border-white/5 hover:bg-white/5 hover:border-white/10 rounded-2xl p-4 transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white overflow-hidden p-1 ${
                    asset.type === 'Crypto' ? 'bg-gradient-to-br from-orange-500 to-yellow-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {asset.logoid ? (
                      <img src={`https://s3-symbol-logo.tradingview.com/${asset.logoid}.svg`} alt={asset.symbol} className="w-full h-full object-contain rounded-lg" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = asset.symbol[0]; }} />
                    ) : (
                      asset.symbol[0]
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm tracking-wide group-hover:text-accent transition-colors">{asset.name}</p>
                    <p className="text-gray-500 text-[10px] font-bold">{asset.symbol}</p>
                  </div>
                </div>
                <Star className="w-4 h-4 text-gray-600 group-hover:text-yellow-500 transition-colors" />
              </div>
              
              <div>
                <p className="text-xl font-bold font-mono text-white mb-2">
                  {(price || 0).toLocaleString('en-US', { minimumFractionDigits: (price || 0) > 1000 ? 2 : 4 })}
                </p>
                <div className="h-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Sparklines data={[price*0.9, price*0.95, price*1.02, price*1.05, price*0.98, price*1.01, price]} margin={2}>
                    <SparklinesLine color={change.isPositive ? '#10B981' : '#EF4444'} style={{ strokeWidth: 3 }} />
                  </Sparklines>
                </div>
                <div className={`flex items-center text-xs font-bold ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {change.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {change.val}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
