import React, { useState, useEffect, useRef } from 'react';
import { Package } from '../types';
import { Search, X, Package as PackageIcon, Truck, User } from 'lucide-react';
import { getStatusColor } from '../constants/colors';
import { twMerge } from 'tailwind-merge';

interface GlobalSearchProps {
  packages: Package[];
  onSelectPackage: (pkg: Package) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ packages, onSelectPackage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Fuzzy search
  const filteredPackages = packages.filter(pkg => {
    const searchTerms = query.toLowerCase().split(' ');
    const searchableText = [
      pkg.trackingNumber,
      pkg.recipientName,
      pkg.recipientPhone,
      pkg.courier,
      pkg.unitNumber,
      pkg.status
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4"
      onClick={() => {
        setIsOpen(false);
        setQuery('');
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tracking number, nama, telepon, kurir..."
            className="flex-1 outline-none text-sm placeholder:text-slate-400"
          />
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono border border-slate-300">
              ESC
            </kbd>
            <button 
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredPackages.length === 0 && query ? (
            <div className="p-8 text-center text-slate-400">
              <PackageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Tidak ada hasil ditemukan</p>
              <p className="text-xs mt-1">Coba kata kunci lain</p>
            </div>
          ) : query === '' ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Mulai mengetik untuk mencari</p>
              <p className="text-xs mt-1">Tracking number, nama, telepon, atau kurir</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPackages.slice(0, 10).map(pkg => {
                const statusColor = getStatusColor(pkg.status);
                return (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      onSelectPackage(pkg);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left p-4 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Package Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <PackageIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                          <span className="font-mono text-sm font-bold text-slate-900 group-hover:text-blue-600">
                            {pkg.trackingNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                          <User className="w-3 h-3" />
                          <span className="font-medium">{pkg.recipientName}</span>
                          <span className="text-slate-400">•</span>
                          <span>Unit {pkg.unitNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Truck className="w-3 h-3" />
                          {pkg.courier} • Size {pkg.size}
                        </div>
                      </div>

                      {/* Right: Status Badge */}
                      <span className={twMerge(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border-2 whitespace-nowrap",
                        statusColor.bg, statusColor.text, statusColor.border
                      )}>
                        {pkg.status}
                      </span>
                    </div>
                  </button>
                );
              })}
              
              {filteredPackages.length > 10 && (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-50">
                  +{filteredPackages.length - 10} hasil lainnya
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono border border-slate-300">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono border border-slate-300">Enter</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono border border-slate-300">ESC</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
