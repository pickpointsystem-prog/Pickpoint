import React, { useState, useRef, useEffect } from 'react';
import { User, Package, PackageSize, Customer, Location } from '../types';
import { StorageService } from '../services/storage';
import { WhatsAppService } from '../services/whatsapp';
import { COURIER_OPTIONS } from '../constants';
import { X, Camera, Scan } from 'lucide-react';
import SimpleScanner from './SimpleScanner';

interface MobileAddPackageProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const MobileAddPackage: React.FC<MobileAddPackageProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    tracking: '',
    recipientName: '',
    recipientPhone: '',
    unitNumber: '',
    courier: COURIER_OPTIONS[0],
    size: 'M' as PackageSize,
    locationId: user.locationId || '',
    photo: ''
  });
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setCustomers(StorageService.getCustomers());
    setLocations(StorageService.getLocations());
  }, []);

  const handleNameInput = (val: string) => {
    if (val.trim() === '') {
      setFormData(prev => ({ 
        ...prev, 
        recipientName: '', 
        recipientPhone: '', 
        unitNumber: '' 
      }));
      setIsAutoFilled(false);
      setShowSuggestions(false);
      return;
    }

    setFormData(prev => ({ ...prev, recipientName: val }));
    setIsAutoFilled(false);

    if (val.length > 0) {
      const matches = customers.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
      setFilteredCustomers(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (cust: Customer) => {
    setFormData(prev => ({
      ...prev,
      recipientName: cust.name,
      recipientPhone: cust.phoneNumber,
      unitNumber: cust.unitNumber,
      locationId: prev.locationId
    }));
    setIsAutoFilled(true);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.locationId) {
      alert('Pilih lokasi terlebih dahulu.');
      return;
    }

    const trackingNumber = formData.tracking.trim();
    if (!trackingNumber) {
      alert('Nomor resi/awb wajib diisi.');
      return;
    }

    const recipientPhone = formData.recipientPhone.trim();

    const newPkg: Package = {
      id: `pkg_${Date.now()}`,
      trackingNumber,
      recipientName: formData.recipientName,
      recipientPhone,
      unitNumber: formData.unitNumber,
      courier: formData.courier,
      size: formData.size,
      locationId: formData.locationId,
      status: 'ARRIVED',
      dates: { arrived: new Date().toISOString() },
      feePaid: 0,
      photo: formData.photo,
      notificationStatus: 'PENDING'
    };

    // Check if new customer needed
    const existingCust = customers.find(c => c.phoneNumber === recipientPhone);
    if (!existingCust) {
      StorageService.saveCustomer({
        id: `cust_${Date.now()}`,
        name: formData.recipientName,
        phoneNumber: recipientPhone,
        unitNumber: formData.unitNumber,
        locationId: formData.locationId,
        isMember: false
      });
    }

    // Send WhatsApp notification
    let finalNotificationStatus: Package['notificationStatus'] = 'PENDING';
    const loc = locations.find(l => l.id === newPkg.locationId);
    if (loc) {
      const settings = StorageService.getSettings();
      const success = await WhatsAppService.sendNotification(newPkg, loc, settings);
      finalNotificationStatus = success ? 'SENT' : 'FAILED';
      if (!success) {
        alert('Notifikasi WhatsApp gagal dikirim.');
      }
    }

    StorageService.savePackage({ ...newPkg, notificationStatus: finalNotificationStatus });
    
    alert('✅ Paket berhasil disimpan!');
    onSuccess();
  };

  const startCamera = async () => {
    try {
      // Stop any previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false 
        });
      } catch (err) {
        console.warn('[MobileAddPackage] Environment camera failed, trying any camera:', err);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      
      streamRef.current = stream;
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setIsTakingPhoto(true);
    } catch (err) {
      alert('Tidak dapat mengakses kamera');
      console.error('[MobileAddPackage] Camera error:', err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    
    canvas.width = vw;
    canvas.height = vh;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, vw, vh);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setFormData(prev => ({ ...prev, photo: dataUrl }));
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsTakingPhoto(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
        <h2 className="font-bold text-lg text-slate-800">Tambah Paket</h2>
        <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Modal */}
      {isTakingPhoto && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline />
          </div>
          <div className="p-4 flex gap-3">
            <button
              onClick={stopCamera}
              className="flex-1 bg-slate-600 text-white py-3 rounded-lg font-semibold"
            >
              Batal
            </button>
            <button
              onClick={capturePhoto}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold"
            >
              Ambil Foto
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-24">
        {/* AWB */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Resi/AWB *</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.tracking}
              onChange={(e) => setFormData(prev => ({ ...prev, tracking: e.target.value }))}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg"
              required
            />
            <button
              type="button"
              onClick={() => setIsBarcodeScannerOpen(true)}
              className="p-3 bg-blue-600 text-white rounded-lg"
            >
              <Scan className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nama Penerima with Search */}
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Penerima *</label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) => handleNameInput(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
            placeholder="Ketik nama untuk mencari..."
            required
          />
          {showSuggestions && filteredCustomers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredCustomers.map(cust => (
                <button
                  key={cust.id}
                  type="button"
                  onClick={() => selectCustomer(cust)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-100 last:border-0"
                >
                  <div className="font-semibold text-slate-800">{cust.name}</div>
                  <div className="text-xs text-slate-500">{cust.phoneNumber} • Unit {cust.unitNumber}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Telepon *</label>
          <input
            type="tel"
            value={formData.recipientPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, recipientPhone: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
            disabled={isAutoFilled}
            required
          />
        </div>

        {/* Nomor Unit */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Unit *</label>
          <input
            type="text"
            value={formData.unitNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
            disabled={isAutoFilled}
            required
          />
        </div>

        {/* Kurir */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Kurir</label>
          <select
            value={formData.courier}
            onChange={(e) => setFormData(prev => ({ ...prev, courier: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          >
            {COURIER_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Ukuran */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Ukuran Paket</label>
          <div className="grid grid-cols-3 gap-2">
            {(['S', 'M', 'L'] as PackageSize[]).map(size => (
              <button
                key={size}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, size }))}
                className={`py-3 rounded-lg font-semibold transition-colors ${
                  formData.size === size
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Foto */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Foto Paket (Opsional)</label>
          {formData.photo ? (
            <div className="relative">
              <img src={formData.photo} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="w-full py-3 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Ambil Foto
            </button>
          )}
        </div>
      </form>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-semibold"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold"
        >
          Simpan & Kirim Notif
        </button>
      </div>

      {/* Barcode Scanner */}
      <SimpleScanner
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScan={(code) => {
          setFormData(prev => ({ ...prev, tracking: code }));
          setIsBarcodeScannerOpen(false);
        }}
        title="Scan AWB / Barcode"
      />
    </div>
  );
};

export default MobileAddPackage;
