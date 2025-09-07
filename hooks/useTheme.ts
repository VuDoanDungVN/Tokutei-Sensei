import { useEffect } from 'react';
import { UserSettings } from '../types';

export const useTheme = (settings: UserSettings) => {
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    if (settings.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', settings.theme);
    }
    
    // Apply font size
    root.setAttribute('data-font-size', settings.fontSize);
    
    // Apply compact mode
    root.setAttribute('data-compact', settings.compactMode.toString());
    
    // Listen for system theme changes when auto theme is enabled
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, settings.fontSize, settings.compactMode]);
};
