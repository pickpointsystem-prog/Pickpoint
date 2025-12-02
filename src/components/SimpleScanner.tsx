import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface SimpleScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (text: string) => void;
  title?: string;
}

/**
 * SimpleScanner - Scanner sederhana menggunakan html5-qrcode
 * Support QR code dan barcode umum (CODE128, EAN13, dll)
 */
const SimpleScanner: React.FC<SimpleScannerProps> = ({ 
  isOpen, 
  onClose, 
  onScan,
  title = 'Scan Kode'
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string>('');
  const scannerId = 'simple-scanner-reader';

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    startScanner();

    return () => {
      cleanup();
    };
  }, [isOpen]);

  const startScanner = () => {
    try {
      setError('');
      
      // Buat scanner dengan config sederhana
      scannerRef.current = new Html5QrcodeScanner(
        scannerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        },
        /* verbose= */ false
      );

      // Render scanner
      scannerRef.current.render(
        (decodedText) => {
          console.log('[SimpleScanner] Decoded:', decodedText);
          onScan(decodedText);
          cleanup();
          onClose();
        },
        () => {
          // Scan error - normal saat scanning, tidak perlu log
        }
      );
    } catch (e: any) {
      console.error('[SimpleScanner] Error:', e);
      setError('Gagal memulai scanner: ' + (e?.message || 'Unknown error'));
    }
  };

  const cleanup = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (e) {
      console.warn('[SimpleScanner] Cleanup error:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-white" />
            <h2 className="font-semibold text-white text-lg">{title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 m-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Scanner Container */}
        <div className="p-4">
          <div id={scannerId} className="w-full" />
          
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Arahkan kamera ke QR code atau barcode
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Scanner akan otomatis menutup setelah berhasil
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleScanner;
