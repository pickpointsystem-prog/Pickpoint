import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, Sun, Moon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const LanguageThemeToggle: React.FC = () => {
  const { language, theme, setLanguage, setTheme } = useApp();

  return (
    <div className="flex items-center gap-3">
      {/* Language Selector */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setLanguage('id')}
          className={twMerge(
            "px-3 py-1.5 text-xs font-bold rounded transition-all",
            language === 'id'
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          )}
          title="Bahasa Indonesia"
        >
          ID
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={twMerge(
            "px-3 py-1.5 text-xs font-bold rounded transition-all",
            language === 'en'
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          )}
          title="English"
        >
          EN
        </button>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default LanguageThemeToggle;
