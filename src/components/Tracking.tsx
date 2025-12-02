
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { PricingService } from '../services/pricing';
import { Package, Location } from '../types';
import { Search, Clock, CheckCircle, AlertTriangle, QrCode, X } from 'lucide-react';
import QRCodeLib from 'qrcode';

const Tracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState<{pkg: Package, loc: Location, fee: number} | null>(null);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-search on load if param exists
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      handleSearch(id);
    }
  }, [searchParams]);

  // Generate QR Code when result changes and QR is shown
  useEffect(() => {
    if (result && showQR && qrCanvasRef.current) {
      const qrData = JSON.stringify({
        id: result.pkg.id,
        tracking: result.pkg.trackingNumber,
        name: result.pkg.recipientName,
        phone: result.pkg.recipientPhone,
        pickupCode: result.pkg.pickupCode,
        location: result.loc.name
      });
      
      QRCodeLib.toCanvas(qrCanvasRef.current, qrData, {
        width: 240,
        margin: 1,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      });
    }
  }, [result, showQR]);

  const handleSearch = (trackingId: string) => {
    const trimmed = trackingId.trim();
    if(!trimmed) {
      setError('Masukkan nomor resi/AWB terlebih dahulu');
      return;
    }
    setError('');
    setResult(null);

    const packages = StorageService.getPackages();
    // Cari dengan case-insensitive dan trim space
    const found = packages.find(p => 
      p.trackingNumber.trim().toLowerCase() === trimmed.toLowerCase() ||
      p.id.toLowerCase() === trimmed.toLowerCase()
    );

    if (found) {
      const locations = StorageService.getLocations();
      const customers = StorageService.getCustomers();
      
      const loc = locations.find(l => l.id === found.locationId);
      const cust = customers.find(c => c.phoneNumber === found.recipientPhone);
      
      if (loc) {
        const fee = PricingService.calculateFee(found, loc, cust);
        setResult({ pkg: found, loc, fee });
      } else {
        setError("Data lokasi tidak ditemukan. Hubungi administrator.");
      }
    } else {
      setError("Paket tidak ditemukan. Periksa kembali nomor resi/AWB Anda.");
    }
  };

  // Auto-show detail dari URL tanpa search field
  const isDirectLink = searchParams.get('id') && !error && result;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Search field - Hidden jika direct link dan ada result */}
          {!isDirectLink && (
            <div className="p-2 border-b border-slate-100 flex gap-2">
              <input 
                className="w-full px-4 py-3 outline-none text-slate-700 font-medium"
                placeholder="e.g. JNE123456789"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch(query)}
              />
              <button 
                onClick={() => handleSearch(query)}
                className="bg-slate-900 text-white p-3 rounded-xl hover:bg-black transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-slate-600 font-medium">{error}</p>
            </div>
          )}

          {result && (
            <div>
              {/* Status Banner */}
              <div className={`p-4 text-center font-bold text-white ${
                result.pkg.status === 'ARRIVED' ? 'bg-blue-500' :
                result.pkg.status === 'PICKED' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                PACKAGE {result.pkg.status}
              </div>
              
              <div className="p-4 space-y-3">
                 {/* Photo */}
                 {result.pkg.photo && (
                   <div className="rounded-lg overflow-hidden border border-slate-200 h-32">
                     <img src={result.pkg.photo} className="w-full h-full object-cover" />
                   </div>
                 )}

                 {/* Key Details */}
                 <div className="grid grid-cols-2 gap-2">
                   <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">AWB</p>
                     <p className="text-sm font-mono font-bold text-slate-800 tracking-wider">
                       {result.pkg.trackingNumber}
                     </p>
                   </div>
                   <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Location</p>
                     <p className="text-xs font-bold text-slate-800 line-clamp-2">{result.loc.name}</p>
                   </div>
                 </div>

                 {/* Fees */}
                 {result.pkg.status === 'ARRIVED' && (
                   <>
                     <div className="border border-orange-200 bg-orange-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-bold text-orange-800 uppercase">Current Fee</p>
                          <p className="text-[9px] text-orange-600">Pay at cashier</p>
                        </div>
                        <p className="text-lg font-bold text-orange-600">Rp {result.fee.toLocaleString()}</p>
                     </div>

                     {/* QR Code Button */}
                     <button
                       onClick={() => setShowQR(true)}
                       className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md text-sm"
                     >
                       <QrCode className="w-4 h-4" />
                       Tampilkan QR Code
                     </button>
                   </>
                 )}

                 {/* Timeline */}
                 <div className="space-y-2 pt-1">
                   <div className="flex gap-2">
                     <div className="mt-0.5"><Clock className="w-3.5 h-3.5 text-slate-400" /></div>
                     <div>
                       <p className="text-xs font-semibold text-slate-700">Arrived at Reception</p>
                       <p className="text-[10px] text-slate-500">{new Date(result.pkg.dates.arrived).toLocaleString()}</p>
                     </div>
                   </div>
                   {result.pkg.dates.picked && (
                     <div className="flex gap-2">
                       <div className="mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /></div>
                       <div>
                         <p className="text-xs font-semibold text-slate-700">Picked Up</p>
                         <p className="text-[10px] text-slate-500">{new Date(result.pkg.dates.picked).toLocaleString()}</p>
                       </div>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-4">
          &copy; 2024 Pickpoint
        </p>
      </div>

      {/* QR Code Modal */}
      {showQR && result && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-center font-bold text-slate-800 mb-3 text-lg">QR Code Pickup</h3>
            <p className="text-center text-xs text-slate-500 mb-4">
              Tunjukkan QR ini ke petugas untuk scan
            </p>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
              <div className="bg-white p-3 rounded-lg inline-block shadow-sm w-full flex justify-center">
                <canvas ref={qrCanvasRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
