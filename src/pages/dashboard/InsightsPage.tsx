import { useState, useEffect, useMemo, useCallback } from 'react';
import { Newspaper, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, TrendingUp, TrendingDown, Minus, Zap, BarChart3 } from 'lucide-react';
import { useTradingStore } from '../../store/tradingStore';
import { LOCAL_ASSETS } from '../../lib/localAssets';

interface GeneratedInsight {
  id: number;
  title: string;
  category: string;
  time: string;
  impact: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  symbol: string;
  change: number;
}

export const InsightsPage = () => {
  const { livePriceChanges, livePrices } = useTradingStore();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fgiScore, setFgiScore] = useState<number | null>(null);
  const [fgiLabel, setFgiLabel] = useState<string>('');
  const [fgiLoading, setFgiLoading] = useState(true);

  // Fetch real Fear & Greed Index
  const fetchFGI = useCallback(async () => {
    setFgiLoading(true);
    try {
      const res = await fetch('/api/fgi/fng/?limit=1');
      const data = await res.json();
      if (data?.data?.[0]) {
        setFgiScore(parseInt(data.data[0].value, 10));
        setFgiLabel(data.data[0].value_classification || 'Neutral');
      }
    } catch (e) {
      console.error('Error fetching Fear & Greed Index:', e);
    }
    setFgiLoading(false);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    fetchFGI();
    const interval = setInterval(fetchFGI, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchFGI]);

  // Real sentiment from live Fear & Greed + price data
  const { score, label, color, offset } = useMemo(() => {
    const activeScore = fgiScore ?? 50;
    const activeLabel = fgiLabel || 'Neutral';

    let clr = 'text-yellow-500';
    if (activeScore >= 75) clr = 'text-green-500';
    else if (activeScore >= 55) clr = 'text-lime-400';
    else if (activeScore <= 25) clr = 'text-red-500';
    else if (activeScore <= 45) clr = 'text-orange-400';

    const dashOffset = 125 - (125 * (activeScore / 100));
    return { score: activeScore, label: activeLabel, color: clr, offset: dashOffset };
  }, [fgiScore, fgiLabel]);

  // Generate real-time market insights from actual live price data
  const liveInsights = useMemo(() => {
    const changes = Object.entries(livePriceChanges);
    if (changes.length === 0) return [];

    // Sort by absolute change to find the most significant movers
    const sorted = changes
      .filter(([, change]) => !isNaN(change) && change !== 0)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

    const insights: GeneratedInsight[] = [];


    sorted.slice(0, 15).forEach(([symbol, change], index) => {
      const asset = LOCAL_ASSETS.find(a => a.symbol === symbol);
      if (!asset) return;

      const name = asset.name;
      const absChange = Math.abs(change);
      const isBullish = change > 0;
      const price = livePrices[symbol];

      let title: string;
      let impact: string;

      if (absChange > 5) {
        // Extreme movement
        impact = 'high';
        title = isBullish
          ? `🚀 ${name} (${symbol}) surges ${change.toFixed(2)}% — Breaking major resistance levels`
          : `🔻 ${name} (${symbol}) crashes ${absChange.toFixed(2)}% — Critical support breached`;
      } else if (absChange > 2) {
        // Significant movement
        impact = 'high';
        title = isBullish
          ? `${name} rallies ${change.toFixed(2)}% amid strong buying momentum`
          : `${name} drops ${absChange.toFixed(2)}% as sellers dominate the session`;
      } else if (absChange > 1) {
        // Moderate movement
        impact = 'medium';
        title = isBullish
          ? `${name} gains ${change.toFixed(2)}% — Positive sentiment drives ${symbol} higher`
          : `${name} declines ${absChange.toFixed(2)}% — Weakness across ${asset.type} sector`;
      } else if (absChange > 0.3) {
        // Light movement
        impact = 'low';
        title = isBullish
          ? `${name} edges up ${change.toFixed(2)}% in steady trading session`
          : `${name} dips ${absChange.toFixed(2)}% on mild profit-taking`;
      } else {
        // Very small movement
        impact = 'low';
        title = `${name} holds near $${price?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '—'} with ${change.toFixed(2)}% change`;
      }

      // Stagger times slightly to look natural
      const minutesAgo = Math.min(index * 2, 28);
      const timeStr = minutesAgo === 0 ? 'Just now' : `${minutesAgo}m ago`;

      insights.push({
        id: Date.now() + index,
        title,
        category: asset.type,
        time: timeStr,
        impact,
        sentiment: isBullish ? 'bullish' : change === 0 ? 'neutral' : 'bearish',
        symbol,
        change
      });
    });

    return insights;
  }, [livePriceChanges, livePrices]);

  // Market movers from real price data
  const topMovers = useMemo(() => {
    return Object.entries(livePriceChanges)
      .filter(([, change]) => !isNaN(change) && change !== 0)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 6)
      .map(([symbol, change]) => {
        const asset = LOCAL_ASSETS.find(a => a.symbol === symbol);
        return {
          symbol,
          name: asset?.name || symbol,
          type: asset?.type || 'Unknown',
          change,
          price: livePrices[symbol] || 0
        };
      });
  }, [livePriceChanges, livePrices]);

  // Sector summary from real data
  const sectorSummary = useMemo(() => {
    const sectors: Record<string, { total: number; count: number }> = {};

    Object.entries(livePriceChanges).forEach(([symbol, change]) => {
      if (isNaN(change)) return;
      const asset = LOCAL_ASSETS.find(a => a.symbol === symbol);
      if (!asset) return;

      if (!sectors[asset.type]) sectors[asset.type] = { total: 0, count: 0 };
      sectors[asset.type].total += change;
      sectors[asset.type].count += 1;
    });

    return Object.entries(sectors)
      .map(([sector, data]) => ({
        sector,
        avgChange: data.count > 0 ? data.total / data.count : 0,
        count: data.count
      }))
      .sort((a, b) => b.avgChange - a.avgChange);
  }, [livePriceChanges]);

  return (
    <div className="p-6 md:p-8 space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide mb-2">Market Insights</h1>
          <p className="text-gray-400">
            Live market intelligence powered by real-time price data.
            {lastUpdated && (
              <span className="text-gray-600 ml-2 text-xs">
                FGI Updated {lastUpdated.toLocaleTimeString()} · Prices update every 4s
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchFGI}
          disabled={fgiLoading}
          className="flex items-center space-x-2 bg-accent/10 border border-accent/30 text-accent px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-accent hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${fgiLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main News Feed - Derived from Real Price Data */}
        <div className="lg:col-span-2 bg-navy-light/40 border border-white/5 rounded-3xl shadow-xl flex flex-col">
          <div className="p-6 border-b border-white/5 bg-navy/20 flex items-center justify-between shrink-0">
            <div className="flex items-center">
              <Newspaper className="w-5 h-5 text-accent mr-3" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Live Market Feed
                <span className="text-xs text-gray-500 font-normal ml-2">· Real-time price action</span>
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {liveInsights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
                <p className="font-bold text-sm">Waiting for market data…</p>
                <p className="text-xs text-gray-600 mt-1">Insights will appear as live prices stream in.</p>
              </div>
            ) : (
              liveInsights.map(insight => (
                <div
                  key={insight.id}
                  className="group bg-navy/40 border border-white/5 hover:border-white/20 p-5 rounded-2xl transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded">
                          {insight.category}
                        </span>
                        <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded">{insight.symbol}</span>
                        <span className="text-xs text-gray-500 font-bold">{insight.time}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-accent transition-colors leading-snug">
                        {insight.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-3 md:flex-col md:items-end md:space-x-0 md:space-y-2 shrink-0">
                      <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border flex items-center
                        ${insight.sentiment === 'bullish' ? 'text-green-500 border-green-500/20 bg-green-500/10' :
                          insight.sentiment === 'bearish' ? 'text-red-500 border-red-500/20 bg-red-500/10' :
                            'text-gray-400 border-gray-500/20 bg-gray-500/10'}
                      `}>
                        {insight.sentiment === 'bullish' ? <ArrowUpRight className="w-3 h-3 mr-1" /> :
                          insight.sentiment === 'bearish' ? <ArrowDownRight className="w-3 h-3 mr-1" /> :
                            <Minus className="w-3 h-3 mr-1" />}
                        {insight.change >= 0 ? '+' : ''}{insight.change.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        Impact: <span className={insight.impact === 'high' ? 'text-orange-500' : insight.impact === 'medium' ? 'text-yellow-500' : 'text-gray-400'}>{insight.impact}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fear & Greed Gauge — Real API Data */}
          <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white tracking-wide mb-1">Market Sentiment</h3>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4">
              {fgiScore !== null ? 'Crypto Fear & Greed Index · Live' : 'Loading…'}
            </p>
            <div className="relative h-48 flex items-center justify-center">
              <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1D1438" strokeWidth="12" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#sentiment-gradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray="125" strokeDashoffset={offset} className="transition-all duration-1000" />
                <defs>
                  <linearGradient id="sentiment-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center translate-y-4">
                {fgiLoading && fgiScore === null ? (
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                ) : (
                  <>
                    <span className="text-3xl font-black text-white">{score}</span>
                    <span className={`text-xs font-bold ${color} uppercase tracking-widest mt-1`}>{label}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sector Performance — Real Data */}
          {sectorSummary.length > 0 && (
            <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-white tracking-wide mb-4 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                <span>Sector Performance <span className="text-gray-600 font-normal text-xs">· Live</span></span>
              </h4>
              <div className="space-y-3">
                {sectorSummary.map(sector => (
                  <div key={sector.sector} className="flex items-center justify-between bg-navy/40 border border-white/5 px-4 py-3 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">{sector.sector}</p>
                      <p className="text-[10px] text-gray-500">{sector.count} assets tracked</p>
                    </div>
                    <span className={`text-sm font-mono font-bold ${sector.avgChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {sector.avgChange >= 0 ? '+' : ''}{sector.avgChange.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Movers — Real Data */}
          {topMovers.length > 0 && (
            <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-white tracking-wide mb-4 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Top Movers <span className="text-gray-600 font-normal text-xs">· Live</span></span>
              </h4>
              <div className="space-y-3">
                {topMovers.map(mover => (
                  <div key={mover.symbol} className="flex items-center justify-between bg-navy/40 border border-white/5 px-4 py-3 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">{mover.symbol}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[100px]">{mover.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-white">
                        {mover.price > 0 ? (mover.price > 1 ? mover.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : mover.price.toFixed(6)) : '—'}
                      </p>
                      <p className={`text-[10px] font-bold flex items-center justify-end ${mover.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {mover.change >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                        {mover.change >= 0 ? '+' : ''}{mover.change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
