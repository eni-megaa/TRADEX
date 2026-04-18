import { CurrencyConverter } from '../../components/tools/CurrencyConverter';

export const CurrencyConverterPage = () => {
  return (
    <div className="animate-fade-in w-full">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Currency <span className="text-accent">Converter</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Get real-time exchange rates and accurately convert between global currencies using our dynamic calculator.
        </p>
      </div>
      <CurrencyConverter />
    </div>
  );
};
