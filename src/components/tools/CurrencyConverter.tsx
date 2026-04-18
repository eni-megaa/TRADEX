import { useState, useEffect } from 'react';
import { ArrowRightLeft, DollarSign } from 'lucide-react';

export const CurrencyConverter = () => {
  const [amount, setAmount] = useState<number | string>(1000);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(0);

  // Expanded mock exchange rates relative to USD
  const ratesToUSD: { [key: string]: number } = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 151.20,
    'AUD': 1.52,
    'CAD': 1.35,
    'CHF': 0.90,
    'CNY': 7.23,
    'NZD': 1.66
  };

  useEffect(() => {
    calculate();
  }, [amount, fromCurrency, toCurrency]);

  const calculate = () => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setResult(0);
      return;
    }

    // Convert from -> USD -> To
    const amountInUSD = numAmount / ratesToUSD[fromCurrency];
    const convertedAmount = amountInUSD * ratesToUSD[toCurrency];
    setResult(convertedAmount);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-navy-light rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-white">Currency Converter</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
        <input 
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-navy border border-white/10 rounded-md px-4 py-4 text-2xl text-white font-bold tracking-wider focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-400 mb-2">From</label>
          <select 
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full bg-navy border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent"
          >
            {Object.keys(ratesToUSD).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleSwap}
          className="mt-6 p-3 rounded-full bg-accent/10 hover:bg-accent/20 text-accent transition-colors flex-shrink-0"
        >
          <ArrowRightLeft className="h-5 w-5" />
        </button>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-400 mb-2">To</label>
          <select 
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full bg-navy border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent"
          >
            {Object.keys(ratesToUSD).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-navy rounded-lg p-6 border border-white/5 text-center">
        <p className="text-sm font-medium text-gray-400 mb-2">
          {amount} {fromCurrency} equals
        </p>
        <p className="text-4xl md:text-5xl font-bold text-accent">
          {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} <span className="text-2xl text-white">{toCurrency}</span>
        </p>
        <p className="text-xs text-gray-500 mt-4">
          Indicative exchange rates for demonstrational purposes only.
        </p>
      </div>
    </div>
  );
};
