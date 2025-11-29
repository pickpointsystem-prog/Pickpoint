import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmDialog({
      message,
      onConfirm,
      onCancel: onCancel || (() => {})
    });
  }, []);

  const handleConfirm = () => {
    if (confirmDialog) {
      confirmDialog.onConfirm();
      setConfirmDialog(null);
    }
  };

  const handleCancel = () => {
    if (confirmDialog) {
      confirmDialog.onCancel();
      setConfirmDialog(null);
    }
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getToastClasses = (type: ToastType) => {
    const base = "flex items-center gap-3 p-4 rounded-xl shadow-lg border-2 min-w-[320px] animate-in slide-in-from-right duration-300";
    switch (type) {
      case 'success':
        return `${base} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${base} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${base} bg-orange-50 border-orange-200 text-orange-800`;
      case 'info':
        return `${base} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={getToastClasses(toast.type)}>
            <div className="flex-shrink-0">{getToastIcon(toast.type)}</div>
            <p className="flex-1 font-medium text-sm">{toast.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
