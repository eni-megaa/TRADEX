import { useState, useEffect, useMemo } from 'react';
import { Newspaper, BellRing, BrainCircuit, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';

const INITIAL_NEWS_FEED = [
  { id: 1, title: 'Federal Reserve Signals Potential Rate Cut in Q3', category: 'Macro', time: '12 mins ago', impact: 'high', sentiment: 'bullish' },
  { id: 2, title: 'Bitcoin Surges Past $70k Resistance Level', category: 'Crypto', time: '1 hour ago', impact: 'high', sentiment: 'bullish' },
  { id: 3, title: 'Tech Stocks Slide as AI Chip Demand Stabilizes', category: 'Equities', time: '3 hours ago', impact: 'medium', sentiment: 'bearish' },
  { id: 4, title: 'Gold Reaches New All-Time High Amid Geopolitical Tension', category: 'Commodities', time: '5 hours ago', impact: 'high', sentiment: 'bullish' },
  { id: 5, title: 'ECB Maintains Current Interest Rates', category: 'Macro', time: '8 hours ago', impact: 'low', sentiment: 'neutral' }
];

export const InsightsPage = () => {
  const { livePriceChanges, assets } = useTradingStore();
  const [newsFeed, setNewsFeed] = useState(INITIAL_NEWS_FEED);

  const { score, label, color, offset } = useMemo(() => {
    let totalChange = 0;
    let count = 0;
    if (assets.length === 0) return { score: 50, label: 'Neutral', color: 'text-yellow-500', offset: 62.5 };
    
    assets.forEach((asset: any) => {
      const changePct = livePriceChanges[asset.symbol];
      if (changePct !== undefined && !isNaN(changePct)) {
        totalChange += changePct;
        count++;
      }
    });
    
    if (count === 0) return { score: 50, label: 'Neutral', color: 'text-yellow-500', offset: 62.5 };
    const avgChange = totalChange / count;
    
    // Scale avgChange to a 0-100 score. 
    // Assuming +/- 1% average change makes it hit extremes.
    let calculatedScore = Math.round(50 + (avgChange * 50)); 
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));

    let lbl = 'Neutral';
    let clr = 'text-yellow-500';
    
    if (calculatedScore >= 65) { lbl = 'Greed'; clr = 'text-green-500'; }
    else if (calculatedScore <= 35) { lbl = 'Fear'; clr = 'text-red-500'; }

    const dashOffset = 125 - (125 * (calculatedScore / 100));

    return { score: calculatedScore, label: lbl, color: clr, offset: dashOffset };
  }, [livePriceChanges, assets]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentAssets = useTradingStore.getState().assets;
      if (currentAssets.length === 0) return;

      // Find most volatile asset
      let maxVolAsset: any = currentAssets[0];
      let maxVolPct = 0;
      
      currentAssets.forEach((asset: any) => {
        const pct = useTradingStore.getState().livePriceChanges[asset.symbol] || 0;
        if (Math.abs(pct) > Math.abs(maxVolPct)) {
          maxVolAsset = asset;
          maxVolPct = pct;
        }
      });

      if (Math.abs(maxVolPct) > 0.05) { // 0.05% change to trigger news
        const isBullish = maxVolPct >= 0;
        const templates = isBullish ? [
          `${maxVolAsset.name} Momentum Accelerates, Breaks Resistance`,
          `Institutional Interest Drives ${maxVolAsset.symbol} Rally`,
          `${maxVolAsset.name} Surges Amid Favorable Market Conditions`
        ] : [
          `${maxVolAsset.name} Faces Selling Pressure, Tests Support`,
          `Market Uncertainty Weighs Heavily on ${maxVolAsset.symbol}`,
          `${maxVolAsset.name} Declines Following Broader Market Selloff`
        ];

        const newNews = {
          id: Date.now(),
          title: templates[Math.floor(Math.random() * templates.length)],
          category: maxVolAsset.type,
          time: 'Just now',
          impact: Math.abs(maxVolPct) > 0.5 ? 'high' : 'medium',
          sentiment: isBullish ? 'bullish' : 'bearish'
        };

        setNewsFeed(prev => [newNews, ...prev].slice(0, 10));
      }
    }, 12000); // 12 seconds per news event

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide mb-2">Market Insights</h1>
          <p className="text-gray-400">AI-curated global news, sentiment analysis, and macro events.</p>
        </div>
        <button className="flex items-center space-x-2 bg-accent/10 border border-accent/30 text-accent px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-accent hover:text-white transition-all">
          <BrainCircuit className="w-4 h-4" />
          <span>AI Daily Briefing</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main News Feed */}
        <div className="lg:col-span-2 bg-navy-light/40 border border-white/5 rounded-3xl shadow-xl flex flex-col">
          <div className="p-6 border-b border-white/5 bg-navy/20 flex items-center shrink-0">
            <Newspaper className="w-5 h-5 text-accent mr-3" />
            <h2 className="text-lg font-bold text-white tracking-wide">Live Global Feed</h2>
          </div>
          <div className="p-6 space-y-4">
            {newsFeed.map(news => (
               <div key={news.id} className="group bg-navy/40 border border-white/5 hover:border-white/20 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all cursor-pointer">
                 <div className="flex-1">
                   <div className="flex items-center space-x-3 mb-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded">
                       {news.category}
                     </span>
                     <span className="text-xs text-gray-500 font-bold">{news.time}</span>
                   </div>
                   <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{news.title}</h3>
                 </div>
                 <div className="flex items-center space-x-3 md:flex-col md:items-end md:space-x-0 md:space-y-2 shrink-0">
                    <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border flex items-center
                      ${news.sentiment === 'bullish' ? 'text-green-500 border-green-500/20 bg-green-500/10' : 
                        news.sentiment === 'bearish' ? 'text-red-500 border-red-500/20 bg-red-500/10' : 
                        'text-gray-400 border-gray-500/20 bg-gray-500/10'}
                    `}>
                      {news.sentiment === 'bullish' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : 
                       news.sentiment === 'bearish' ? <ArrowDownRight className="w-3 h-3 mr-1" /> : null}
                      {news.sentiment}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Impact: <span className={news.impact === 'high' ? 'text-orange-500' : 'text-gray-400'}>{news.impact}</span>
                    </span>
                 </div>
               </div>
            ))}
          </div>
        </div>

        {/* AI Sentiment Analysis Sidebar */}
        <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col space-y-6">
           <div>
             <h3 className="text-lg font-bold text-white tracking-wide mb-4">Overall Market Sentiment</h3>
             <div className="relative h-48 flex items-center justify-center">
                {/* Mock Gauge */}
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1D1438" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray="125" strokeDashoffset={offset} className="transition-all duration-1000" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="50%" stopColor="#EAB308" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center translate-y-4">
                  <span className="text-3xl font-black text-white">{score}</span>
                  <span className={`text-xs font-bold ${color} uppercase tracking-widest mt-1`}>{label}</span>
                </div>
             </div>
           </div>

           <div className="bg-navy/40 border border-white/5 p-5 rounded-2xl">
             <div className="flex items-center space-x-2 mb-3">
               <BellRing className="w-4 h-4 text-orange-500" />
               <h4 className="text-sm font-bold text-white tracking-wide">Upcoming Events</h4>
             </div>
             <ul className="space-y-4">
               <li className="flex justify-between items-start border-l-2 border-orange-500 pl-3">
                 <div>
                   <p className="text-sm font-bold text-white">US NFP Report</p>
                   <p className="text-xs text-gray-500 font-bold">Expect high volatility in USD pairs.</p>
                 </div>
                 <span className="text-[10px] text-gray-400 font-bold uppercase">Tomorrow</span>
               </li>
               <li className="flex justify-between items-start border-l-2 border-blue-500 pl-3">
                 <div>
                   <p className="text-sm font-bold text-white">AAPL Earnings</p>
                   <p className="text-xs text-gray-500 font-bold">Q4 Revenue report.</p>
                 </div>
                 <span className="text-[10px] text-gray-400 font-bold uppercase">Oct 28</span>
               </li>
             </ul>
           </div>
        </div>

      </div>
    </div>
  );
};
