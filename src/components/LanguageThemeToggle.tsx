import React from 'react';
import { useApp } from '../context/AppContext';
import { twMerge } from 'tailwind-merge';

const LanguageThemeToggle: React.FC = () => {
  const { language, setLanguage } = useApp();

  return (
    <div className="flex items-center gap-1 bg-white rounded-md p-1 border border-slate-200 shadow-sm">
      <button
        onClick={() => setLanguage('id')}
        className={twMerge(
          "px-3 py-2 text-xl rounded transition-all cursor-pointer",
          language === 'id'
            ? "bg-slate-200 shadow"
            : "hover:bg-slate-100"
        )}
        title="Bahasa Indonesia"
      >
        🇮🇩
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={twMerge(
          "px-3 py-2 text-xl rounded transition-all cursor-pointer",
          language === 'en'
            ? "bg-slate-200 shadow"
            : "hover:bg-slate-100"
        )}
        title="English"
      >
        🇬🇧
      </button>
    </div>
  );
};

export default LanguageThemeToggle;

