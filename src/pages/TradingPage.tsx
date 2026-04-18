import { useEffect, useRef } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { useThemeStore } from '../store/themeStore';
import { TradingWatchlist } from '../components/dashboard/TradingWatchlist';
import { Maximize2, Zap, ArrowLeftRight } from 'lucide-react';

export const TradingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedAsset } = useTradingStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // Load TradingView Widget
  useEffect(() => {
    if (containerRef.current) {
      // Clear container for re-render
      containerRef.current.innerHTML = '';

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": selectedAsset.tvExchange || `BINANCE:${selectedAsset.symbol}`,
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": isDark ? "dark" : "light",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "backgroundColor": isDark ? "rgba(10, 8, 20, 1)" : "rgba(255, 255, 255, 1)",
        "gridColor": isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.06)",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "container_id": "tradingview_widget_main",
        "support_host": "https://www.tradingview.com"
      });
      containerRef.current.appendChild(script);
    }
  }, [selectedAsset, isDark]);
  const pageRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!pageRef.current) return;
    if (!document.fullscreenElement) {
      pageRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div ref={pageRef} className="h-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-bg-dark">
      {/* Main Content - TradingView Chart */}
      <div className="flex-none h-[500px] lg:flex-1 lg:h-auto order-1 flex flex-col relative z-10">
        {/* Chart Container */}
        <div className="flex-1 w-full relative">
          <div ref={containerRef} className="absolute inset-0 w-full h-full" id="tradingview_widget_main" />
          
          {/* Custom Fullscreen Button */}
          <button 
            onClick={toggleFullscreen}
            className="absolute top-2 right-12 z-10 px-3 py-1.5 bg-bg-card border border-white/10 rounded flex items-center space-x-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            title="Fullscreen Page"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Fullscreen Page</span>
          </button>
        </div>
      </div>

      {/* Sidebar - Watchlist & Search */}
      <div className="w-full lg:w-[260px] order-2 flex flex-col flex-none min-h-[600px] lg:min-h-0 lg:h-auto border-t lg:border-t-0 lg:border-l relative z-20 border-white/5 bg-bg-dark">
        <div className="p-4 flex items-center justify-between border-b flex-none border-white/5 bg-navy/20">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-accent fill-accent/20" />
            <h1 className="text-sm font-black tracking-widest uppercase text-white">Watchlist</h1>
          </div>
          <div className="flex space-x-1">
            <div className="p-1.5 rounded-lg bg-navy hover:bg-white/5 cursor-pointer transition-colors">
              <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden lg:overflow-hidden relative">
          <TradingWatchlist />
        </div>
      </div>

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  );
};
