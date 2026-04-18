import { AnalyticalTools } from '../../components/tools/AnalyticalTools';

export const AnalyticalToolsPage = () => {
  return (
    <div className="animate-fade-in w-full">
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Analytical <span className="text-accent">Tools</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Empower your trading decisions with advanced charting, real-time data, and comprehensive technical analysis indicators.
        </p>
      </div>
      <AnalyticalTools />
    </div>
  );
};
