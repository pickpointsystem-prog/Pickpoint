import React, { useState, useEffect } from 'react';
import { Package, Bell, LogOut, History } from 'lucide-react';

interface Package {
  id: string;
  tracking_number: string;
  status: 'ARRIVED' | 'PICKED' | 'DESTROYED';
  recipient_name: string;
  created_at: string;
  dates?: {
    arrivedAt?: string;
    pickedAt?: string;
  };
}

interface CustomerPortalProps {
  customer: {
    id: string;
    phoneNumber: string;
    name: string;
    isMember: boolean;
  };
  onLogout: () => void;
}

/**
 * CustomerPortal - Halaman portal customer
 * Menampilkan: daftar paket, notifikasi, history
 */
const CustomerPortal: React.FC<CustomerPortalProps> = ({ customer, onLogout }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filter, setFilter] = useState<'all' | 'arrived' | 'picked'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadPackages();
    subscribeToUpdates();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('pp_customer_token');

      const response = await fetch('/api/packages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal memuat paket');
      }

      const data = await response.json();
      setPackages(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    // TODO: Integrasi dengan Socket.io untuk notifikasi realtime
    console.log('[CustomerPortal] Ready for Socket.io integration');
  };

  const filteredPackages = packages.filter((pkg) => {
    if (filter === 'arrived') return pkg.status === 'ARRIVED';
    if (filter === 'picked') return pkg.status === 'PICKED';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ARRIVED':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'PICKED':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'DESTROYED':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ARRIVED':
        return '📦 Paket Tiba';
      case 'PICKED':
        return '✓ Sudah Diambil';
      case 'DESTROYED':
        return '✗ Tidak Valid';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Portal Paket</h1>
            <p className="text-sm text-slate-500">Halo, {customer.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">
              {packages.filter((p) => p.status === 'ARRIVED').length}
            </div>
            <p className="text-sm text-slate-600 mt-2">Paket Tiba</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">
              {packages.filter((p) => p.status === 'PICKED').length}
            </div>
            <p className="text-sm text-slate-600 mt-2">Sudah Diambil</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600">
              {customer.isMember ? '✓ Member' : 'Non-Member'}
            </div>
            <p className="text-sm text-slate-600 mt-2">Status</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              Semua Paket
            </button>
            <button
              onClick={() => setFilter('arrived')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'arrived'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              Paket Tiba
            </button>
            <button
              onClick={() => setFilter('picked')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'picked'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              Sudah Diambil
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Packages List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-slate-600 mt-4">Memuat paket...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Tidak ada paket</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${getStatusColor(
                  pkg.status
                ).split(' ')[0]} border-l-4`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">{pkg.tracking_number}</h3>
                    <p className="text-sm text-slate-600">{pkg.recipient_name}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      pkg.status
                    )}`}
                  >
                    {getStatusLabel(pkg.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Tanggal Tiba</p>
                    <p className="text-slate-800 font-medium">
                      {new Date(pkg.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  {pkg.dates?.pickedAt && (
                    <div>
                      <p className="text-slate-500">Tanggal Diambil</p>
                      <p className="text-slate-800 font-medium">
                        {new Date(pkg.dates.pickedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  )}
                </div>

                {pkg.status === 'ARRIVED' && (
                  <button className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4" />
                    Ingatkan via WhatsApp
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODO: Integrasi notifikasi push */}
      {/* TODO: Subscribe to Web Push */}
      {/* TODO: Deep link dari WA */}
    </div>
  );
};

export default CustomerPortal;
