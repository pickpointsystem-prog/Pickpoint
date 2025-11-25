import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

const BarcodeScanner: React.FC<BarcodeModalProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const [error, setError] = useState('');

  const stopScanning = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    stopScanning();
    onClose();
  }, [stopScanning, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scanFrame = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          onScan(code.data);
          handleClose();
          return;
        }
      }
      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    const startScanning = async () => {
      try {
        setError('');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          animationFrameId.current = requestAnimationFrame(scanFrame);
        }
      } catch (err: any) {
        setError(err.message || 'Tidak bisa akses kamera. Pastikan izin kamera diberikan.');
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
  }, [isOpen, onScan, handleClose, stopScanning]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" /> Scan Barcode
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden w-full aspect-square">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-60 h-32 border-4 border-white/50 rounded-lg" />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          <div className="text-xs text-slate-500 text-center">
            Arahkan kamera ke barcode atau QR code yang ingin di-scan
          </div>

          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;

