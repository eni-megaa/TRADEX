import { AccountOverview } from '../components/dashboard/AccountOverview';
import { TradingPanel } from '../components/dashboard/TradingPanel';

import { WatchlistPanel } from '../components/dashboard/WatchlistPanel';
import { LiveTrades } from '../components/dashboard/LiveTrades';

export const DashboardOverview = () => {
  return (
    <div className="p-2 md:p-4 lg:h-full flex flex-col min-h-0 relative bg-navy">

      {/* 
        For desktop, we make it fit perfectly without window scroll. 
        On mobile, we allow it to stack and scroll naturally.
      */}
      <div className="flex flex-col lg:flex-row gap-4 lg:h-full min-h-0 lg:overflow-hidden overflow-y-auto relative z-10 w-full overflow-x-hidden">

        {/* Left Column: Recent Assets & Watchlist */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 lg:h-full lg:overflow-y-auto hide-scrollbar pb-4 lg:pb-6">

          <AccountOverview />

          <div className="flex-1 min-h-[400px] lg:min-h-0 w-full overflow-x-auto">
            <WatchlistPanel />
          </div>

        </div>

        {/* Right Column: Execution Panel & Trades */}
        <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-4 lg:h-full lg:overflow-y-auto hide-scrollbar pb-4 lg:pb-6">
          <TradingPanel />
          <div className="flex-1 min-h-[300px] lg:min-h-0 w-full overflow-x-auto">
            <LiveTrades />
          </div>
        </div>

      </div>

      {/* Decorative Background Elements - scaled down for mobile */}
      <div className="absolute top-1/4 left-1/4 w-32 md:w-[500px] h-32 md:h-[500px] bg-accent/5 rounded-full blur-[60px] md:blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-40 md:w-[600px] h-32 md:h-[400px] bg-accent-cyan/10 rounded-full blur-[60px] md:blur-[120px] pointer-events-none -z-10"></div>

    </div>
  );
};
