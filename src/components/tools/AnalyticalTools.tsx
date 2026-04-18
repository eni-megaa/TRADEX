import { useEffect, useRef } from 'react';
import { useThemeStore } from '../../store/themeStore';

export const AnalyticalTools = () => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": "FX:EURUSD",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": isDark ? "dark" : "light",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "backgroundColor": isDark ? "rgba(15, 17, 26, 1)" : "rgba(255, 255, 255, 1)",
        "gridColor": isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "support_host": "https://www.tradingview.com"
      });
      container.current.appendChild(script);
    }
  }, [isDark]);

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border shadow-xl bg-navy border-white/10">
      <div className="tradingview-widget-container h-full w-full">
        <div className="tradingview-widget-container__widget h-full w-full" ref={container}></div>
      </div>
    </div>
  );
};
