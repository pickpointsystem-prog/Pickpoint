import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const LanguageThemeToggle: React.FC = () => {
  const { language, theme, setLanguage, setTheme } = useApp();

  return (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
      {/* Language Selector */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-md p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
        <button
          onClick={() => setLanguage('id')}
          className={twMerge(
            "px-3 py-2 text-xs font-bold rounded transition-all",
            language === 'id'
              ? "bg-amber-400 text-slate-900 shadow"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
          title="Bahasa Indonesia"
        >
          🇮🇩 ID
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={twMerge(
            "px-3 py-2 text-xs font-bold rounded transition-all",
            language === 'en'
              ? "bg-blue-400 text-white shadow"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
          title="English"
        >
          🇬🇧 EN
        </button>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className={twMerge(
          "p-2 rounded-lg transition-all",
          theme === 'dark'
            ? "bg-indigo-600 text-yellow-300 shadow-lg shadow-indigo-600/30"
            : "bg-orange-100 text-orange-600 hover:bg-orange-200"
        )}
        title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default LanguageThemeToggle;
