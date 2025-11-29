import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-200 rounded w-24"></div>
        <div className="h-8 bg-slate-200 rounded w-32"></div>
      </div>
      <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
    </div>
    <div className="h-3 bg-slate-200 rounded w-20"></div>
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
    <div className="p-4 border-b border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-48"></div>
    </div>
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded-full w-24"></div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonModal: React.FC = () => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <div className="h-12 bg-slate-200 rounded-lg flex-1"></div>
        <div className="h-12 bg-slate-200 rounded-lg flex-1"></div>
      </div>
    </div>
  </div>
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`${sizeClasses[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
  );
};
