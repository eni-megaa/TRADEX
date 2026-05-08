import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isResourcesHovered, setIsResourcesHovered] = useState(false);
  const [isResourcesClicked, setIsResourcesClicked] = useState(false);

  const showResourcesDropdown = isResourcesHovered || isResourcesClicked;

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Markets', path: '#markets' },
    { name: 'Platforms', path: '#platforms' },
    { name: 'About', path: '/about' },
    { name: 'Partners', path: '/partners' }
  ];

  const resourceLinks = [
    { name: 'Analytical Tools', path: '/tools/analytical' },
    { name: 'Economic Calendar', path: '/tools/economic-calendar' },
    { name: 'Trading Calculator', path: '/tools/calculator' },
    { name: 'Currency Converter', path: '/tools/converter' }
  ];

  return (
    <nav className="fixed w-full z-50 bg-navy/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-white tracking-tighter">
              TRADE<span className="text-accent">X</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {links.map((link) => (
                link.path.startsWith('/') ? (
                  <Link key={link.name} to={link.path} className="text-gray-300 hover:text-accent transition-colors text-sm font-medium">
                    {link.name}
                  </Link>
                ) : (
                  <a key={link.name} href={link.path} className="text-gray-300 hover:text-accent transition-colors text-sm font-medium">
                    {link.name}
                  </a>
                )
              ))}

              {/* Resources Dropdown */}
              <div
                className="relative rounded-md"
                onMouseEnter={() => setIsResourcesHovered(true)}
                onMouseLeave={() => setIsResourcesHovered(false)}
              >
                <button
                  onClick={() => setIsResourcesClicked(!isResourcesClicked)}
                  className={`transition-colors text-sm font-medium flex items-center py-2 ${showResourcesDropdown ? 'text-accent' : 'text-gray-300 hover:text-accent'}`}
                >
                  Resources
                  <svg className={`w-4 h-4 ml-1 transition-transform ${showResourcesDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showResourcesDropdown && (
                  <div className="absolute top-full left-0 pt-2 z-50 animate-fade-in">
                    <div className="w-56 rounded-md shadow-lg bg-navy border border-white/10 overflow-hidden">
                      <div className="py-1">
                        {resourceLinks.map((link) => (
                          <Link
                            key={link.name}
                            to={link.path}
                            className="block px-4 py-3 text-sm text-gray-300 hover:bg-navy-light hover:text-accent transition-colors"
                            onClick={() => {
                              setIsResourcesClicked(false);
                              setIsResourcesHovered(false);
                            }}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/login" className="text-white hover:text-accent transition-colors font-medium">
              Login
            </Link>
            <Link to="/register" className="bg-accent text-navy px-5 py-2 rounded-md font-bold hover:bg-accent-hover transition-colors">
              Register
            </Link>
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-navy-light border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              link.path.startsWith('/') ? (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-accent hover:bg-navy transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.path}
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-accent hover:bg-navy transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              )
            ))}

            <div className="px-3 py-2 text-base font-medium text-white border-b border-white/10 mt-2 mb-1">
              Resources
            </div>
            {resourceLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block pl-6 pr-3 py-2 text-sm font-medium text-gray-400 hover:text-accent hover:bg-navy transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 flex flex-col space-y-2 px-3">
              <Link to="/login" className="text-center text-white py-2 hover:text-accent transition-colors font-medium">
                Login
              </Link>
              <Link to="/register" className="text-center bg-accent text-navy px-5 py-2 rounded-md font-bold hover:bg-accent-hover transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
