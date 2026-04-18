import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

export const TradingCalculator = () => {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [pair, setPair] = useState('EURUSD');
  const [lots, setLots] = useState<number | string>(1);
  const [leverage, setLeverage] = useState(100);

  const [margin, setMargin] = useState(0);
  const [pipValue, setPipValue] = useState(0);

  // Mock exchange rates to USD
  const rates: { [key: string]: number } = {
    'EURUSD': 1.0850,
    'GBPUSD': 1.2640,
    'USDJPY': 151.20,
    'AUDUSD': 0.6550,
    'USDCAD': 1.3520
  };

  useEffect(() => {
    calculate();
  }, [accountCurrency, pair, lots, leverage]);

  const calculate = () => {
    const volume = Number(lots) * 100000; // 1 standard lot = 100,000 units
    if (isNaN(volume) || volume <= 0) {
      setMargin(0);
      setPipValue(0);
      return;
    }

    let requiredMargin = (volume / leverage);

    // If base currency isn't account currency, convert margin to account currency
    if (pair.startsWith('EUR') && accountCurrency === 'USD') {
      requiredMargin *= rates['EURUSD'];
    } else if (pair.startsWith('GBP') && accountCurrency === 'USD') {
      requiredMargin *= rates['GBPUSD'];
    }
    
    // Pip value calculation (standard lot = $10 per pip if quote is USD)
    let pip = 10 * Number(lots);
    if (pair.endsWith('JPY')) {
      pip = (1000 / rates['USDJPY']) * Number(lots);
    }

    setMargin(requiredMargin);
    setPipValue(pip);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-navy-light rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
          <Calculator className="h-5 w-5 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-white">Trading Calculator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Account Currency</label>
          <select 
            value={accountCurrency}
            onChange={(e) => setAccountCurrency(e.target.value)}
            className="w-full bg-navy border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Instrument</label>
          <select 
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full bg-navy border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent"
          >
            {Object.keys(rates).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Volume (Lots)</label>
          <input 
            type="number"
            min="0.01"
            step="0.01"
            value={lots}
            onChange={(e) => setLots(e.target.value)}
            className="w-full bg-navy border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Leverage 1:</label>
          <select 
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full bg-navy border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
        </div>
      </div>

      <div className="bg-navy rounded-lg p-6 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">Required Margin</p>
          <p className="text-3xl font-bold text-accent">
            {accountCurrency === 'USD' ? '$' : accountCurrency === 'EUR' ? '€' : '£'}
            {margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">Pip Value</p>
          <p className="text-3xl font-bold text-white">
            {accountCurrency === 'USD' ? '$' : accountCurrency === 'EUR' ? '€' : '£'}
            {pipValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};
