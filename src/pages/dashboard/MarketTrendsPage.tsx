import { TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { useTradingStore } from '../../store/tradingStore';
import { useEffect } from 'react';

export const MarketTrendsPage = () => {
  const { livePrices, livePriceChanges, assets, fetchAssets } = useTradingStore();
  
  useEffect(() => {
    if (assets.length === 0) {
      fetchAssets();
    }
  }, [assets.length, fetchAssets]);
  
  // Create an array with calculated change percentage
  const assetsWithChange = assets.map(asset => {
    const currentPrice = livePrices[asset.symbol] || 0;
    const changePct = livePriceChanges[asset.symbol] !== undefined 
      ? livePriceChanges[asset.symbol] 
      : ((Math.random() - 0.5) * 5); // mock percent change if not loaded yet
    return { ...asset, currentPrice, changePct };
  });

  // Extract specific assets for heatmap blocks
  const btcAsset = assetsWithChange.find(a => a.symbol === 'BTCUSDT');
  const eurAsset = assetsWithChange.find(a => a.symbol === 'EURUSD');
  const ndxAsset = assetsWithChange.find(a => a.symbol === 'NDX');
  const xauAsset = assetsWithChange.find(a => a.symbol === 'XAUUSD');

  const getChangePct = (asset: any) => asset.changePct.toFixed(2);
  const getChangeColor = (changePct: number) => changePct >= 0 ? 'text-green-500' : 'text-red-500';
  const getBgGradient = (changePct: number) => changePct >= 0 
    ? 'from-green-500/20 to-green-600/30 border-green-500/20' 
    : 'from-red-500/20 to-red-600/30 border-red-500/20';
  const getIcon = (changePct: number) => changePct >= 0 ? <TrendingUp className="w-4 h-4 mr-1"/> : <TrendingDown className="w-4 h-4 mr-1"/>;

  // Sort Top Gainers vs Top Losers
  const sorted = [...assetsWithChange].sort((a, b) => b.changePct - a.changePct);
  const topGainers = sorted.slice(0, 8);
  const topLosers = sorted.slice(-8).reverse();

  return (
    <div className="p-6 md:p-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide mb-2">Market Trends</h1>
          <p className="text-gray-400">Macro overview of global asset sector performance and volatility.</p>
        </div>
      </div>

      <div className="bg-navy-light/40 border border-white/5 rounded-3xl shadow-xl flex flex-col">
        <div className="p-6 space-y-8">
          
          {/* Heatmap Layout */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-black text-white tracking-wide">Sector Heatmap</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
              {/* Massive Crypto Block */}
              {btcAsset && (
                <div className={`col-span-1 lg:col-span-2 row-span-2 bg-gradient-to-br ${getBgGradient(btcAsset.changePct)} border rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer`}>
                  <div className="flex justify-between">
                    <span className="text-white font-black tracking-wide bg-navy/50 px-3 py-1 rounded-lg">CRYPTO</span>
                    <span className={`${getChangeColor(btcAsset.changePct)} font-mono font-bold flex items-center bg-navy/50 px-3 py-1 rounded-lg`}>
                      {getIcon(btcAsset.changePct)}{btcAsset.changePct >= 0 ? '+' : ''}{getChangePct(btcAsset)}%
                    </span>
                  </div>
                  <div>
                    <h3 className="text-4xl font-mono font-bold text-white mb-2">{btcAsset.symbol.replace('USDT', '/USDT')}</h3>
                    <p className={`${getChangeColor(btcAsset.changePct)} font-bold`}>{btcAsset.changePct >= 0 ? '+' : ''}{getChangePct(btcAsset)}% (DOM)</p>
                  </div>
                </div>
              )}

              {/* Forex Block */}
              {eurAsset && (
                <div className={`col-span-1 row-span-1 bg-gradient-to-br ${getBgGradient(eurAsset.changePct)} border rounded-3xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer`}>
                  <div className="flex justify-between">
                    <span className="text-white font-bold text-xs bg-navy/50 px-2 py-1 rounded-md">FOREX</span>
                    <span className={`${getChangeColor(eurAsset.changePct)} font-mono text-xs font-bold flex items-center bg-navy/50 px-2 py-1 rounded-md`}>
                      {getIcon(eurAsset.changePct)}{eurAsset.changePct >= 0 ? '+' : ''}{getChangePct(eurAsset)}%
                    </span>
                  </div>
                  <h3 className="text-xl font-mono font-bold text-white">{eurAsset.symbol.replace('USD', '/USD')}</h3>
                </div>
              )}

              {/* Equities Block */}
              {ndxAsset && (
                <div className={`col-span-1 row-span-1 bg-gradient-to-br ${getBgGradient(ndxAsset.changePct)} border rounded-3xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer`}>
                  <div className="flex justify-between">
                    <span className="text-white font-bold text-xs bg-navy/50 px-2 py-1 rounded-md">EQUITIES</span>
                    <span className={`${getChangeColor(ndxAsset.changePct)} font-mono text-xs font-bold flex items-center bg-navy/50 px-2 py-1 rounded-md`}>
                      {getIcon(ndxAsset.changePct)}{ndxAsset.changePct >= 0 ? '+' : ''}{getChangePct(ndxAsset)}%
                    </span>
                  </div>
                  <h3 className="text-xl font-mono font-bold text-white">{ndxAsset.name}</h3>
                </div>
              )}
              
              {/* Commodities Block */}
              {xauAsset && (
                <div className={`col-span-1 lg:col-span-2 row-span-1 bg-gradient-to-br ${getBgGradient(xauAsset.changePct)} border rounded-3xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer`}>
                  <div className="flex justify-between">
                    <span className="text-white font-bold text-xs bg-navy/50 px-2 py-1 rounded-md">COMMODITIES</span>
                    <span className={`${getChangeColor(xauAsset.changePct)} font-mono text-xs font-bold flex items-center bg-navy/50 px-2 py-1 rounded-md`}>
                      {getIcon(xauAsset.changePct)}{xauAsset.changePct >= 0 ? '+' : ''}{getChangePct(xauAsset)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-mono font-bold text-white">{xauAsset.symbol.replace('USD', '/USD')}</h3>
                    <p className="text-gray-400 font-mono text-sm">${xauAsset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-white/5">
            {/* Top Gainers List */}
            <div>
              <h3 className="text-lg font-black text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" /> Top Gainers
              </h3>
              <div className="space-y-3">
                {topGainers.map((asset, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-navy/40 rounded-2xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500 font-mono w-4">{i + 1}</span>
                      <span className="font-bold text-white">{asset.symbol}</span>
                    </div>
                    <span className="text-green-500 font-mono font-bold">+{asset.changePct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers List */}
            <div>
              <h3 className="text-lg font-black text-white mb-4 flex items-center">
                <TrendingDown className="w-5 h-5 text-red-500 mr-2" /> Top Losers
              </h3>
              <div className="space-y-3">
                {topLosers.map((asset, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-navy/40 rounded-2xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500 font-mono w-4">{i + 1}</span>
                      <span className="font-bold text-white">{asset.symbol}</span>
                    </div>
                    <span className="text-red-500 font-mono font-bold">-{Math.abs(asset.changePct).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
