import { useEffect, useRef } from 'react';
import { useThemeStore } from '../../store/themeStore';

export const EconomicCalendar = () => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": isDark ? "dark" : "light",
        "isTransparent": true,
        "width": "100%",
        "height": "100%",
        "locale": "en",
        "importanceFilter": "-1,0,1",
        "currencyFilter": "USD,EUR,ITL,NZD,CHF,AUD,FRF,JPY,ZAR,TRL,CAD,DEM,MXN,ESP,GBP"
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
