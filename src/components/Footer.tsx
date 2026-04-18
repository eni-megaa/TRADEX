import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-navy-dark border-t border-white/10 pt-16 pb-8 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-white tracking-tighter mb-4 inline-block">
              TRADE<span className="text-accent">X</span>
            </Link>
            <p className="text-gray-400 text-sm mt-4">
              Your trusted partner in global financial markets. Trade Forex, Crypto, Stocks, and Commodities on an award-winning platform.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Markets</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-accent transition-colors">Forex Trading</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Cryptocurrency</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Stock CFDs</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Commodities</a></li>
            </ul>
          </div>

          <div>
            <Link to="/about" className="font-bold mb-4 uppercase text-sm tracking-wider hover:text-accent transition-colors block">Company</Link>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-accent transition-colors">Careers</Link></li>
              <li><Link to="/partners" className="hover:text-accent transition-colors">Partners program</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <Link to="/partners" className="font-bold mb-4 uppercase text-sm tracking-wider hover:text-accent transition-colors block">Legal</Link>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/risk-disclosure" className="hover:text-accent transition-colors">Risk Disclosure</Link></li>
              <li><Link to="/aml-policy" className="hover:text-accent transition-colors">AML Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-xs text-gray-500 text-center">
          <p className="mb-2">
            <strong>Risk Warning:</strong> Trading foreign exchange and Contract for Differences (CFDs) is highly speculative, carries a high level of risk and may not be suitable for all investors. You may sustain a loss of some or all of your invested capital, therefore, you should not speculate with capital that you cannot afford to lose.
          </p>
          <p>© {new Date().getFullYear()} TradeX Brokerage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
