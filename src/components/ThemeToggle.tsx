import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 opacity-0"></div>;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
        theme === 'light' 
          ? 'bg-accent/10 hover:bg-accent/20 text-accent' 
          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
      }`}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Sun className="w-5 h-5 animate-in spin-in-90 fade-in duration-300" />
      ) : (
        <Moon className="w-5 h-5 animate-in spin-in-90 fade-in duration-300" />
      )}
    </button>
  );
};
