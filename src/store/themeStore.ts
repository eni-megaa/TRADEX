import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        get().initTheme(); // Apply immediately
      },
      setTheme: (theme) => {
        set({ theme });
        get().initTheme();
      },
      initTheme: () => {
        const { theme } = get();
        if (theme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      },
    }),
    {
      name: 'trade-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initTheme();
        }
      },
    }
  )
);
