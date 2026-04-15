import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed right-4 bottom-4 z-[100] px-3 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl text-xs font-semibold text-white hover:bg-white/15 transition-colors"
      aria-label="Змінити тему"
      title={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
    >
      {theme === 'dark' ? 'Світла тема' : 'Темна тема'}
    </button>
  );
}
