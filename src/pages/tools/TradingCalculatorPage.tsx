import { TradingCalculator } from '../../components/tools/TradingCalculator';

export const TradingCalculatorPage = () => {
  return (
    <div className="animate-fade-in w-full">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Trading <span className="text-accent">Calculator</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Calculate your exact margin requirements and pip values instantly to manage your risk with precision before placing any trade.
        </p>
      </div>
      <TradingCalculator />
    </div>
  );
};
