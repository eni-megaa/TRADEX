import { useEffect, useRef, memo } from 'react';
import { useThemeStore } from '../store/themeStore';

export const TickerTapeWidget = memo(() => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
          { "proName": "FOREXCOM:NSXUSD", "title": "US 100" },
          { "proName": "FX_IDC:EURUSD", "title": "EUR/USD" },
          { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
          { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" },
          { "proName": "OANDA:GBPUSD", "title": "GBP/USD" }
        ],
        "showSymbolLogo": true,
        "isTransparent": true,
        "displayMode": "adaptive",
        "colorTheme": isDark ? "dark" : "light",
        "locale": "en"
      });
      container.current.appendChild(script);
    }
  }, [isDark]);

  return (
    <div className="tradingview-widget-container w-full">
      <div className="tradingview-widget-container__widget" ref={container}></div>
    </div>
  );
});
