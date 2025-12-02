
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { PricingService } from '../services/pricing';
import { Package, Location } from '../types';
import { Search, Clock, CheckCircle, AlertTriangle, QrCode } from 'lucide-react';
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
              
              <div className="p-6 space-y-6">
                 {/* Photo */}
                 {result.pkg.photo && (
                   <div className="rounded-xl overflow-hidden border border-slate-200 h-48">
                     <img src={result.pkg.photo} className="w-full h-full object-cover" />
                   </div>
                 )}

                 {/* Key Details */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <p className="text-xs text-slate-400 font-bold uppercase">AWB</p>
                     <p className="text-xl font-mono font-bold text-slate-800 tracking-wider">
                       {result.pkg.trackingNumber}
                     </p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <p className="text-xs text-slate-400 font-bold uppercase">Location</p>
                     <p className="text-sm font-bold text-slate-800 line-clamp-2">{result.loc.name}</p>
                   </div>
                 </div>

                 {/* Fees */}
                 {result.pkg.status === 'ARRIVED' && (
                   <>
                     <div className="border border-orange-200 bg-orange-50 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-orange-800 uppercase">Current Fee</p>
                          <p className="text-[10px] text-orange-600">Pay at cashier</p>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">Rp {result.fee.toLocaleString()}</p>
                     </div>

                     {/* QR Code Button */}
                     <button
                       onClick={() => setShowQR(!showQR)}
                       className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                     >
                       <QrCode className="w-5 h-5" />
                       {showQR ? 'Sembunyikan QR Code' : 'Tampilkan QR Code untuk Scan'}
                     </button>

                     {/* QR Code Display */}
                     {showQR && (
                       <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 sm:p-6 text-center border-2 border-slate-200">
                         <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Scan QR di Petugas</h3>
                         <p className="text-xs text-slate-500 mb-3 sm:mb-4">
                           Tunjukkan QR ini ke petugas untuk verifikasi cepat
                         </p>
                         <div className="bg-white p-3 sm:p-4 rounded-xl inline-block shadow-md max-w-full">
                           <canvas ref={qrCanvasRef} className="max-w-full h-auto"></canvas>
                         </div>
                         <div className="mt-4 bg-white rounded-lg p-3 border border-slate-200">
                           <p className="text-xs text-slate-500 uppercase font-bold mb-1">Pickup Code</p>
                           <p className="text-2xl font-mono font-bold text-blue-600 tracking-wider">
                             {result.pkg.pickupCode || result.pkg.trackingNumber}
                           </p>
                         </div>
                       </div>
                     )}
                   </>
                 )}

                 {/* Timeline */}
                 <div className="space-y-3 pt-2">
                   <div className="flex gap-3">
                     <div className="mt-1"><Clock className="w-4 h-4 text-slate-400" /></div>
                     <div>
                       <p className="text-sm font-bold text-slate-700">Arrived at Reception</p>
                       <p className="text-xs text-slate-500">{new Date(result.pkg.dates.arrived).toLocaleString()}</p>
                     </div>
                   </div>
                   {result.pkg.dates.picked && (
                     <div className="flex gap-3">
                       <div className="mt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                       <div>
                         <p className="text-sm font-bold text-slate-700">Picked Up</p>
                         <p className="text-xs text-slate-500">{new Date(result.pkg.dates.picked).toLocaleString()}</p>
                       </div>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; 2024 Pickpoint Tracking System
        </p>
      </div>
    </div>
  );
};

export default Tracking;
