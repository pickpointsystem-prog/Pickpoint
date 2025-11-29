import React from 'react';
import { Package as PackageType } from '../types';
import { CheckCircle, Package as PackageIcon, Trash2, Clock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface PackageTimelineProps {
  pkg: PackageType;
}

const PackageTimeline: React.FC<PackageTimelineProps> = ({ pkg }) => {
  const events = [
    {
      status: 'ARRIVED',
      date: pkg.dates.arrived,
      icon: PackageIcon,
      color: 'blue',
      label: 'Paket Tiba',
      description: `Diterima dari ${pkg.courier}`
    },
    pkg.dates.picked && {
      status: 'PICKED',
      date: pkg.dates.picked,
      icon: CheckCircle,
      color: 'green',
      label: 'Paket Diambil',
      description: `Oleh ${pkg.recipientName}`
    },
    pkg.dates.destroyed && {
      status: 'DESTROYED',
      date: pkg.dates.destroyed,
      icon: Trash2,
      color: 'red',
      label: 'Paket Dihapus/Hilang',
      description: 'Tidak diambil'
    }
  ].filter(Boolean);

  return (
    <div className="relative pl-8">
      {/* Vertical Line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-slate-200 to-slate-100"></div>

      {events.map((event: any, index) => {
        const isLast = index === events.length - 1;
        const colorClasses = {
          blue: 'bg-blue-500 text-white shadow-blue-200',
          green: 'bg-green-500 text-white shadow-green-200',
          red: 'bg-red-500 text-white shadow-red-200'
        };

        const bgClasses = {
          blue: 'bg-blue-50 border-blue-200',
          green: 'bg-green-50 border-green-200',
          red: 'bg-red-50 border-red-200'
        };

        return (
          <div key={index} className={twMerge("relative pb-8", isLast && "pb-0")}>
            {/* Icon Circle */}
            <div className={twMerge(
              "absolute -left-[27px] w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 transition-transform hover:scale-110",
              colorClasses[event.color as keyof typeof colorClasses]
            )}>
              <event.icon className="w-4 h-4" />
            </div>

            {/* Content Card */}
            <div className={twMerge(
              "border rounded-lg p-4 transition-all hover:shadow-md",
              bgClasses[event.color as keyof typeof bgClasses]
            )}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm">{event.label}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {new Date(event.date).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Additional Info */}
              {event.status === 'ARRIVED' && (
                <div className="mt-2 pt-2 border-t border-blue-200 flex items-center gap-3 text-xs">
                  <span className="font-mono bg-white px-2 py-1 rounded border border-blue-200 text-slate-700">
                    {pkg.trackingNumber}
                  </span>
                  <span className="text-slate-600">Size: {pkg.size}</span>
                </div>
              )}

              {event.status === 'PICKED' && pkg.feePaid && (
                <div className="mt-2 pt-2 border-t border-green-200 text-xs text-slate-600">
                  Biaya: <span className="font-bold text-green-700">Rp {pkg.feePaid.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PackageTimeline;
