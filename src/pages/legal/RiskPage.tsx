import { AlertOctagon, TrendingDown, Layers, Zap } from 'lucide-react';

export const RiskPage = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center max-w-4xl mx-auto">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertOctagon className="text-red-500 w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Risk Disclosure
        </h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Trading Foreign Exchange (Forex) and CFDs carries a high level of risk.
          You may lose all of your invested capital.
        </p>
      </section>

      <div className="bg-navy-light/20 border border-red-500/10 p-8 md:p-12 rounded-[3.5rem] relative shadow-2xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] -z-10"></div>

        <div className="prose prose-invert prose-sm max-w-none space-y-12">
          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <TrendingDown className="text-red-500 w-5 h-5 shrink-0" />
              1. General Trading Risk
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-4">
              <p>
                Trading financial instruments involves significant risk and is not suitable for everyone.
                Prices can move rapidly and unpredictably due to market news, economic data,
                and geopolitical events.
              </p>
              <p>
                Past performance is not indicative of future results. You should never trade with
                funds you cannot afford to lose ("risk capital").
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <Layers className="text-accent-cyan w-5 h-5 shrink-0" />
              2. Leverage & Margin Risk
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-3">
              <p>
                Leverage allows you to control larger positions with a relatively small amount of capital.
                While this can magnify profits, it also magnifies losses.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Small price movements against your position can result in rapid total loss of funds.</li>
                <li>Margin calls occur if your account equity falls below required levels.</li>
                <li>Positions may be automatically liquidated by the system in fast-moving markets.</li>
                <li>Gapping (slippage) can occur, where prices "jump" past your stop-loss levels.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <Zap className="text-orange-500 w-5 h-5 shrink-0" />
              3. Technology & Execution Risk
            </h2>
            <div className="text-gray-400 leading-relaxed text-[13px] space-y-4">
              <p>
                Trading online carries inherent technical risks, including hardware failure,
                internet connectivity issues, and platform software bugs.
              </p>
              <p>
                TradeX utilizes advanced execution technology, but cannot guarantee 100% uptime.
                Periods of extreme market volatility may result in delayed execution or inability
                to close positions at desired price levels.
              </p>
            </div>
          </section>

          <div className="bg-red-500/5 p-8 rounded-3xl mt-12 border border-red-500/10">
            <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              Crucial Warning
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed italic italic">
              Before deciding to trade, you should carefully consider your investment objectives,
              level of experience, and risk appetite. Seek independent advice if necessary.
              TradeX is not responsible for any losses incurred as a result of using our services.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest italic font-sans">
        TradeX Brokerage. High-Risk Financial Speculation Disclosure. 2026.
      </p>
    </div>
  );
};
