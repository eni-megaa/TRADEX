import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

export const HeatmapSection = () => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "exchanges": [],
        "dataSource": "SPX500",
        "grouping": "sector",
        "blockSize": "market_cap_basic",
        "blockColor": "change",
        "locale": "en",
        "symbolUrl": "",
        "colorTheme": isDark ? "dark" : "light",
        "hasTopBar": true,
        "isDataSetEnabled": false,
        "isZoomEnabled": true,
        "hasSymbolTooltip": true,
        "isToolWidget": true,
        "width": "100%",
        "height": "100%"
      });
      container.current.appendChild(script);
    }
  }, [isDark]);

  return (
    <section className="pt-12 pb-10 bg-navy relative overflow-hidden" id="heatmap">
      {/* Container with standard max-w and px margins to prevent touching edges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Global Market <span className="text-accent">Heatmap</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get a birds-eye view of the market. Instantly identify leading sectors, highly volatile assets, and breaking market trends in real-time.
          </p>
        </div>

        <div className={`w-full h-[600px] md:h-[800px] rounded-xl overflow-hidden border shadow-2xl mx-auto ${isDark ? 'border-white/10 bg-bg-card' : 'border-gray-200 bg-white'}`}>
          <div className="tradingview-widget-container h-full w-full">
            <div className="tradingview-widget-container__widget h-full w-full" ref={container}></div>
          </div>
        </div>
      </div>
    </section>
  );
};
