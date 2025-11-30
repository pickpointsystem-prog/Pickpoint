import { FC, useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

const BarcodeScanner: FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [manualCode, setManualCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setManualCode('');
      return;
    }
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Pindai Barcode</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            Tutup
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Fitur kamera belum tersedia. Masukkan nomor resi di bawah untuk mengisi otomatis.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            placeholder="Masukkan hasil scan"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Gunakan Kode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BarcodeScanner;

