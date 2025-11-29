import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated Icon with Gradient Background */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl shadow-lg">
          <Icon className="w-16 h-16 text-slate-300" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 text-center max-w-md mb-6">{description}</p>

      {/* Optional Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg 
            hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-200 
            hover:shadow-xl hover:scale-105 active:scale-95"
        >
          {action.label}
        </button>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-10 left-10 w-20 h-20 text-blue-100 opacity-30" fill="currentColor" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" />
        </svg>
        <svg className="absolute bottom-20 right-20 w-16 h-16 text-purple-100 opacity-30" fill="currentColor" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" />
        </svg>
      </div>
    </div>
  );
};

export default EmptyState;
