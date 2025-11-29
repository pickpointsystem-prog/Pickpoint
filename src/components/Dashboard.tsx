import React, { useEffect, useState, useRef, useMemo } from 'react';
import { User, Package, DashboardStats, PackageSize, Customer, Location } from '../types';
import { StorageService } from '../services/storage';
import { PricingService } from '../services/pricing';
import { WhatsAppService } from '../services/whatsapp';
import { COURIER_OPTIONS } from '../constants';
import { BRAND_COLORS, getStatusColor } from '../constants/colors';
import { useToast } from '../context/ToastContext';
import BarcodeScanner from './BarcodeScanner';
import { 
  Package as PackageIcon, DollarSign, Users, Activity, 
  ArrowUpRight, ArrowDownRight, Search, Plus, 
  QrCode, X, Truck, CheckCircle, MessageCircle, Trash2, Camera, Lock, TrendingUp, Inbox
} from 'lucide-react';
import EmptyState from './EmptyState';
import ActivityFeed from './ActivityFeed';
import { twMerge } from 'tailwind-merge';

// Helper: Export CSV
function exportPackagesToCSV(packages: Package[]) {
  const headers = [
    'AWB',
    'Recipient Name',
    'Unit',
    'Phone',
    'Courier',
    'Size',
    'Location',
    'Status',
    'Arrived',
    'Picked',
    'Destroyed',
    'Pickup Code',
    'Fee Paid',
    'Notif Status'
  ];
  const rows = packages.map(pkg => [
    pkg.trackingNumber,
    pkg.recipientName,
    pkg.unitNumber,
    pkg.recipientPhone,
    pkg.courier,
    pkg.size,
    pkg.locationId,
    pkg.status,
    pkg.dates.arrived,
    pkg.dates.picked || '',
    pkg.dates.destroyed || '',
    pkg.pickupCode,
    pkg.feePaid,
    pkg.notificationStatus
  ]);
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `packages_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { showToast, showConfirm } = useToast();
  
  // --- STATE: DASHBOARD & PACKAGES ---
  const [filter, setFilter] = useState<'DAY' | 'WEEK' | 'MONTH' | 'ALL'>('DAY');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Package Management State
  const [packages, setPackages] = useState<Package[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState('');
  const [selectedForBulkPickup, setSelectedForBulkPickup] = useState<Set<string>>(new Set()); // Multi-select
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    tracking: '',
    recipientName: '',
    recipientPhone: '',
    unitNumber: '',
    courier: COURIER_OPTIONS[0],
    size: 'M' as PackageSize,
    locationId: user.role === 'STAFF' ? user.locationId! : '',
    photo: ''
  });

  // Suggestion State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isAutoFilled, setIsAutoFilled] = useState(false); // State to lock fields
  const [isScannerOpen, setIsScannerOpen] = useState(false); // Scanner modal

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOADING DATA ---
  const loadData = () => {
    const allPkgs = StorageService.getPackages();
    const allCusts = StorageService.getCustomers();
    setPackages(allPkgs);
    setCustomers(allCusts);
    setLocations(StorageService.getLocations());
    calculateStats(allPkgs, allCusts);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [filter, user]); // Recalculate if filter changes

  // --- STATS CALCULATION ---
  const calculateStats = (allPkgs: Package[], allCusts: Customer[]) => {
    const relevantPkgs = user.role === 'STAFF' 
      ? allPkgs.filter(p => p.locationId === user.locationId)
      : allPkgs;

    const now = new Date();
    const startOfToday = new Date(now.setHours(0,0,0,0));
    
    let filteredForStats = relevantPkgs;
    if (filter === 'DAY') {
       filteredForStats = relevantPkgs.filter(p => new Date(p.dates.arrived) >= startOfToday);
    } else if (filter === 'WEEK') {
       const weekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
       filteredForStats = relevantPkgs.filter(p => new Date(p.dates.arrived) >= weekAgo);
    } else if (filter === 'MONTH') {
       const monthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
       filteredForStats = relevantPkgs.filter(p => new Date(p.dates.arrived) >= monthAgo);
    }

    // Revenue Calculations
    const revPackage = filteredForStats.reduce((acc, curr) => acc + (curr.feePaid || 0), 0);
    const revDelivery = filteredForStats.filter(p => p.status === 'PICKED').length * 0; 
    const activeMembers = allCusts.filter(c => c.isMember && new Date(c.membershipExpiry || '') > new Date());
    const revMembership = activeMembers.length * 50000; 

    const statsObj: DashboardStats = {
      packagesIn: filteredForStats.filter(p => p.status === 'ARRIVED').length, 
      packagesOut: filteredForStats.filter(p => p.status === 'PICKED').length, 
      inventoryActive: relevantPkgs.filter(p => p.status === 'ARRIVED').length, 
      membersActive: activeMembers.length,
      revDelivery,
      revMembership,
      revPackage,
      totalRevenue: revPackage + revDelivery + revMembership
    };
    setStats(statsObj);
  };

  // --- TABLE FILTERING ---
  const filteredPackages = useMemo(() => {
    let res = packages.filter(p => {
        // Search Logic
        const s = search.toLowerCase();
        const matchesSearch = 
            p.trackingNumber.toLowerCase().includes(s) || 
            p.recipientName.toLowerCase().includes(s) ||
            p.unitNumber.toLowerCase().includes(s) ||
            p.recipientPhone.includes(s) ||
            p.pickupCode.includes(s);
        
        // Staff Restriction
        const matchesLoc = user.role === 'STAFF' ? p.locationId === user.locationId : true;
        
        return matchesSearch && matchesLoc;
    });
    
    // Sort: Latest first
    return res.sort((a,b) => new Date(b.dates.arrived).getTime() - new Date(a.dates.arrived).getTime());
  }, [packages, search, user]);

  // --- HANDLERS ---
  const handleNameInput = (val: string) => {
    // If empty, clear everything and unlock
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
    
    // If user types, we unlock to allow new entry, unless they select from dropdown again
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
      // Auto-select location if Admin, otherwise keep staff location
      locationId: user.role === 'ADMIN' ? cust.locationId : prev.locationId 
    }));
    setIsAutoFilled(true); // Lock the fields
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationId) return showToast('warning', 'Pilih lokasi terlebih dahulu');

    // Generate 6-character alphanumeric code (uppercase)
    const generatePickupCode = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    const pickupCode = generatePickupCode();
    const newPkg: Package = {
      id: `pkg_${Date.now()}`,
      trackingNumber: formData.tracking,
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      unitNumber: formData.unitNumber,
      courier: formData.courier,
      size: formData.size,
      locationId: formData.locationId,
      status: 'ARRIVED',
      dates: { arrived: new Date().toISOString() },
      pickupCode,
      feePaid: 0,
      photo: formData.photo,
      notificationStatus: 'PENDING'
    };

    StorageService.savePackage(newPkg);
    StorageService.addActivity({
      id: `act_${Date.now()}`,
      type: 'PACKAGE_ADD',
      description: `Package ${newPkg.trackingNumber} received`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      relatedId: newPkg.id
    });
    
    // Check if new customer needed
    const existingCust = customers.find(c => c.phoneNumber === formData.recipientPhone);
    if (!existingCust) {
        StorageService.saveCustomer({
            id: `cust_${Date.now()}`,
            name: formData.recipientName,
            phoneNumber: formData.recipientPhone,
            unitNumber: formData.unitNumber,
            locationId: formData.locationId,
            isMember: false
        });
    }

    // Trigger WA
    const loc = locations.find(l => l.id === newPkg.locationId);
    if (loc) {
      const settings = StorageService.getSettings();
      WhatsAppService.sendNotification(newPkg, loc, settings);
    }

    setIsAddModalOpen(false);
    setFormData({ ...formData, tracking: '', recipientName: '', recipientPhone: '', unitNumber: '', photo: '' });
    setIsAutoFilled(false);
    loadData();
  };

  const handlePickup = (pkg: Package) => {
    const loc = locations.find(l => l.id === pkg.locationId);
    const cust = customers.find(c => c.phoneNumber === pkg.recipientPhone);
    if (!loc) return;

    const fee = PricingService.calculateFee(pkg, loc, cust);
    
    showConfirm(
      `Confirm Pickup?\nBiaya yang harus dibayar: Rp ${fee.toLocaleString()}`,
      () => {
        const updated: Package = {
          ...pkg,
          status: 'PICKED',
          dates: { ...pkg.dates, picked: new Date().toISOString() },
          feePaid: fee
        };
        StorageService.savePackage(updated);
        StorageService.addActivity({
          id: `act_${Date.now()}`,
          type: 'PACKAGE_PICKUP',
          description: `Package ${pkg.trackingNumber} picked up`,
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: user.name,
          relatedId: pkg.id
        });
        setSelectedPkg(null);
        showToast('success', `Paket berhasil dipickup! Biaya: Rp ${fee.toLocaleString()}`);
        loadData();
      }
    );
  };

  const handleBulkPickup = () => {
    if (selectedForBulkPickup.size === 0) {
      showToast('warning', 'Pilih setidaknya 1 paket untuk diambil');
      return;
    }

    const selectedPkgs = filteredPackages.filter(p => selectedForBulkPickup.has(p.id));
    let totalFee = 0;

    selectedPkgs.forEach(pkg => {
      const loc = locations.find(l => l.id === pkg.locationId);
      const cust = customers.find(c => c.phoneNumber === pkg.recipientPhone);
      const fee = loc ? PricingService.calculateFee(pkg, loc, cust) : 0;
      totalFee += fee;
    });

    const msg = `Konfirmasi pickup ${selectedPkgs.length} paket dengan total biaya Rp ${totalFee.toLocaleString()}?`;
    
    showConfirm(msg, () => {
      selectedPkgs.forEach(pkg => {
        const loc = locations.find(l => l.id === pkg.locationId);
        const cust = customers.find(c => c.phoneNumber === pkg.recipientPhone);
        const fee = loc ? PricingService.calculateFee(pkg, loc, cust) : 0;

        const updated: Package = {
          ...pkg,
          status: 'PICKED',
          dates: { ...pkg.dates, picked: new Date().toISOString() },
          feePaid: fee
        };
        StorageService.savePackage(updated);
        StorageService.addActivity({
          id: `act_${Date.now()}_${pkg.id}`,
          type: 'PACKAGE_PICKUP',
          description: `Package ${pkg.trackingNumber} picked up (Bulk)`,
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: user.name,
          relatedId: pkg.id
        });
      });

      setSelectedForBulkPickup(new Set());
      loadData();
      showToast('success', `${selectedPkgs.length} paket berhasil diambil!`);
    });
  };

  const handleDestroy = (pkg: Package) => {
    showConfirm(`Mark paket ${pkg.trackingNumber} sebagai DESTROYED/LOST?`, () => {
      const updated: Package = {
        ...pkg,
        status: 'DESTROYED',
        dates: { ...pkg.dates, destroyed: new Date().toISOString() },
      };
      StorageService.savePackage(updated);
      StorageService.addActivity({
        id: `act_${Date.now()}`,
        type: 'PACKAGE_UPDATE',
        description: `Package ${pkg.trackingNumber} marked as destroyed`,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        relatedId: pkg.id
      });
      setSelectedPkg(null);
      loadData();
      showToast('success', 'Paket telah ditandai sebagai DESTROYED');
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({ ...prev, photo: ev.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Helper to get selected location details
  const getSelectedLocation = () => locations.find(l => l.id === formData.locationId);

  // --- UI COMPONENTS ---
  const StatCard = ({ label, value, icon: Icon, gradient, sub, trend }: any) => (
    <div className={`${gradient} p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer group relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
            <h3 className="text-4xl font-black text-white">{value}</h3>
            {trend && (
              <div className="flex items-center gap-1 mt-2 text-white/90 text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:bg-white/30 transition-colors">
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        {sub && <p className="text-white/80 text-xs font-medium">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* 0. FILTER BAR (TOP LEFT) */}
      <div className="flex justify-between items-end">
        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 w-fit shadow-sm">
           {(['DAY', 'WEEK', 'MONTH', 'ALL'] as const).map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={twMerge(
                 "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                 filter === f ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
               )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* 1. KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Row 1: Operations */}
        <StatCard label="Paket Masuk" value={stats?.packagesIn || 0} icon={ArrowDownRight} gradient={BRAND_COLORS.gradients.primary} sub="In selected period" trend="↑ 12% vs yesterday" />
        <StatCard label="Paket Keluar" value={stats?.packagesOut || 0} icon={ArrowUpRight} gradient={BRAND_COLORS.gradients.success} sub="Out selected period" trend="↑ 8% vs yesterday" />
        <StatCard label="Total Paket" value={stats?.inventoryActive || 0} icon={PackageIcon} gradient={BRAND_COLORS.gradients.warning} sub="Active Inventory" />
        <StatCard label="Members" value={stats?.membersActive || 0} icon={Users} gradient={BRAND_COLORS.gradients.purple} sub="Active Subscriptions" />
        
        {/* Row 2: Revenue */}
        <StatCard label="Rev. Pengantaran" value={`Rp ${(stats?.revDelivery || 0).toLocaleString()}`} icon={Truck} gradient="bg-gradient-to-br from-teal-500 to-teal-700" />
        <StatCard label="Rev. Membership" value={`Rp ${(stats?.revMembership || 0).toLocaleString()}`} icon={Users} gradient={BRAND_COLORS.gradients.indigo} />
        <StatCard label="Rev. Paket" value={`Rp ${(stats?.revPackage || 0).toLocaleString()}`} icon={Activity} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <StatCard label="Total Revenue" value={`Rp ${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} gradient={BRAND_COLORS.gradients.dark} sub="Gross Total" />
      </div>

      {/* 2. PACKAGES & OVERVIEW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
        <div className="lg:col-span-3 space-y-4">
        {/* Control Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
           {/* Search */}
           <div className="relative w-full lg:w-96 group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
             </div>
             <input
               type="text"
               className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
               placeholder="Search Name, Unit, Phone, AWB, Code..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>

           <div className="flex gap-2 w-full lg:w-auto">
             {/* Export CSV Button */}
             <button
               type="button"
               onClick={() => exportPackagesToCSV(filteredPackages)}
               className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-xs font-bold border border-green-200 shadow-sm transition-all"
             >
               <ArrowDownRight className="w-4 h-4" /> Export CSV
             </button>
             {/* Add Button */}
             <button onClick={() => setIsAddModalOpen(true)} className="flex-shrink-0 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 w-full lg:w-auto">
               <Plus className="w-4 h-4" /> Receive Package
             </button>
           </div>
        </div>

        {/* Bulk Pickup Bar */}
        {selectedForBulkPickup.size > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4 z-40">
            <span className="font-bold">{selectedForBulkPickup.size} paket dipilih</span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkPickup}
                className="bg-white text-blue-600 px-4 py-1.5 rounded font-bold text-sm hover:bg-blue-50 transition-colors"
              >
                Ambil Semua ({selectedForBulkPickup.size})
              </button>
              <button
                onClick={() => setSelectedForBulkPickup(new Set())}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded text-sm transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Data Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-xs sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-4 font-bold w-12">
                    <input
                      type="checkbox"
                      checked={selectedForBulkPickup.size === filteredPackages.filter(p => p.status === 'ARRIVED').length && filteredPackages.some(p => p.status === 'ARRIVED')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const arrivedIds = new Set(filteredPackages.filter(p => p.status === 'ARRIVED').map(p => p.id));
                          setSelectedForBulkPickup(arrivedIds);
                        } else {
                          setSelectedForBulkPickup(new Set());
                        }
                      }}
                      className="accent-blue-600"
                    />
                  </th>
                  <th className="px-6 py-4 font-bold">Package Info</th>
                  <th className="px-6 py-4 font-bold">Recipient</th>
                  <th className="px-6 py-4 font-bold">Date & Time</th>
                  <th className="px-6 py-4 font-bold text-center">Code</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackages.map((pkg, index) => (
                  <tr key={pkg.id} className={twMerge(
                    "transition-all duration-200 group cursor-pointer",
                    index % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                    "hover:bg-blue-50 hover:shadow-md hover:scale-[1.01] hover:z-10"
                  )} onClick={() => { if(pkg.status !== 'ARRIVED') setSelectedPkg(pkg); }}>
                    <td className="px-4 py-4 w-12" onClick={(e) => e.stopPropagation()}>
                      {pkg.status === 'ARRIVED' && (
                        <input
                          type="checkbox"
                          checked={selectedForBulkPickup.has(pkg.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedForBulkPickup);
                            if (e.target.checked) {
                              newSet.add(pkg.id);
                            } else {
                              newSet.delete(pkg.id);
                            }
                            setSelectedForBulkPickup(newSet);
                          }}
                          className="accent-blue-600 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedPkg(pkg)}>
                      <div className="font-mono text-slate-900 font-bold text-sm group-hover:text-blue-600">{pkg.trackingNumber}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium"><Truck className="w-3 h-3" /> {pkg.courier} • Size {pkg.size}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{pkg.recipientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">Unit {pkg.unitNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-medium">{new Date(pkg.dates.arrived).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-400">{new Date(pkg.dates.arrived).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">{pkg.pickupCode}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const statusColor = getStatusColor(pkg.status);
                        const StatusIcon = pkg.status === 'ARRIVED' ? PackageIcon : 
                                          pkg.status === 'PICKED' ? CheckCircle : Trash2;
                        return (
                          <span className={twMerge(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border-2 transition-all",
                            statusColor.bg, statusColor.text, statusColor.border
                          )}>
                            <StatusIcon className="h-3 w-3" />
                            {pkg.status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                         <Search className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {filteredPackages.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="Tidak ada paket"
              description="Belum ada paket yang sesuai dengan pencarian atau filter Anda. Coba sesuaikan kriteria pencarian atau tambah paket baru."
              action={{
                label: "Tambah Paket",
                onClick: () => setIsAddModalOpen(true)
              }}
            />
          )}
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4">
          {filteredPackages.map((pkg) => {
            const statusColor = getStatusColor(pkg.status);
            const StatusIcon = pkg.status === 'ARRIVED' ? PackageIcon : 
                              pkg.status === 'PICKED' ? CheckCircle : Trash2;
            return (
              <div 
                key={pkg.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all active:scale-98"
                onClick={() => setSelectedPkg(pkg)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-mono text-sm font-bold text-slate-900">{pkg.trackingNumber}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Truck className="w-3 h-3" /> {pkg.courier} • Size {pkg.size}
                    </div>
                  </div>
                  <span className={twMerge(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide border-2",
                    statusColor.bg, statusColor.text, statusColor.border
                  )}>
                    <StatusIcon className="h-2.5 w-2.5" />
                    {pkg.status}
                  </span>
                </div>

                {/* Recipient */}
                <div className="mb-2">
                  <div className="text-sm font-semibold text-slate-800">{pkg.recipientName}</div>
                  <div className="text-xs text-slate-500">Unit {pkg.unitNumber}</div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    {new Date(pkg.dates.arrived).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">
                    {pkg.pickupCode}
                  </div>
                </div>

                {/* Checkbox untuk bulk pickup */}
                {pkg.status === 'ARRIVED' && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedForBulkPickup.has(pkg.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newSet = new Set(selectedForBulkPickup);
                          if (e.target.checked) {
                            newSet.add(pkg.id);
                          } else {
                            newSet.delete(pkg.id);
                          }
                          setSelectedForBulkPickup(newSet);
                        }}
                        className="accent-blue-600"
                      />
                      Pilih untuk bulk pickup
                    </label>
                  </div>
                )}
              </div>
            );
          })}

          {/* Mobile Empty State */}
          {filteredPackages.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="Tidak ada paket"
              description="Belum ada paket yang sesuai dengan pencarian atau filter Anda."
              action={{
                label: "Tambah Paket",
                onClick: () => setIsAddModalOpen(true)
              }}
            />
          )}
        </div>
      </div>
      
      <div className="lg:col-span-1 h-full">
         <ActivityFeed />
      </div>
    </div>

      {/* --- MODALS --- */}
      
      {/* 1. ADD PACKAGE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => { if(e.target === e.currentTarget) setIsAddModalOpen(false) }}>
          <div className="bg-white rounded-2xl w-full sm:max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-600" /> Receive Package</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-red-500 transition-colors" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-5">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tracking / AWB</label>
                   <div className="flex gap-2">
                     <input required autoFocus className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.tracking} onChange={e => setFormData({...formData, tracking: e.target.value})} placeholder="Scan or type..." />
                     <button type="button" onClick={() => setIsScannerOpen(true)} className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors" title="Scan Barcode"><QrCode className="w-5 h-5" /></button>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className={getSelectedLocation()?.pricing.type === 'SIZE' ? '' : 'col-span-2'}>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Courier</label>
                     <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white" value={formData.courier} onChange={e => setFormData({...formData, courier: e.target.value})}>
                       {COURIER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>
                   
                   {/* Conditional Size Input */}
                   {getSelectedLocation()?.pricing.type === 'SIZE' && (
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Size</label>
                       <div className="flex bg-slate-100 rounded-lg p-1">
                         {(['S','M','L'] as const).map(s => (
                           <button type="button" key={s} onClick={() => setFormData({...formData, size: s})} className={twMerge("flex-1 text-xs py-1.5 rounded font-bold transition-all", formData.size === s ? "bg-white shadow text-blue-600" : "text-slate-400 hover:text-slate-600")}>{s}</button>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Package Photo</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl h-32 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-300 transition-all relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                       {formData.photo ? (
                         <img src={formData.photo} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                       ) : (
                         <>
                           <Camera className="w-8 h-8 mb-2 text-slate-300" />
                           <span className="text-xs font-medium">Tap to capture</span>
                         </>
                       )}
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </div>
                 </div>
               </div>

               <div className="space-y-5">
                 <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 relative">
                   <h4 className="text-xs font-bold text-blue-800 mb-4 uppercase tracking-wider flex items-center gap-2"><Users className="w-4 h-4" /> Recipient Details</h4>
                   
                   <div className="space-y-3 relative">
                      {/* Name with Suggestion Dropdown */}
                      <div className="relative">
                        <label className="block text-xs font-semibold text-blue-700 mb-1">Full Name</label>
                        <input 
                            className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" 
                            value={formData.recipientName} 
                            onChange={e => handleNameInput(e.target.value)} 
                            onFocus={() => { if(formData.recipientName) setShowSuggestions(true) }}
                            placeholder="Type to search..." 
                        />
                        {/* Dropdown Suggestions */}
                        {showSuggestions && filteredCustomers.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {filteredCustomers.map(c => (
                                    <li 
                                        key={c.id} 
                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-none"
                                        onClick={() => selectCustomer(c)}
                                    >
                                        <div className="font-bold text-sm text-slate-800">{c.name}</div>
                                        <div className="text-xs text-slate-500">Unit {c.unitNumber}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {showSuggestions && filteredCustomers.length === 0 && formData.recipientName && (
                            <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 p-2 text-xs text-slate-400 text-center">
                                New Customer
                            </div>
                        )}
                      </div>

                      {/* Unit Number - Locked if AutoFilled */}
                      <div>
                        <div className="flex justify-between">
                          <label className="block text-xs font-semibold text-blue-700 mb-1">Unit Number</label>
                          {isAutoFilled && <Lock className="w-3 h-3 text-slate-400" />}
                        </div>
                        <input 
                          readOnly={isAutoFilled}
                          className={twMerge(
                            "w-full border border-blue-200 rounded-lg px-3 py-2 text-sm outline-none transition-colors", 
                            isAutoFilled 
                              ? "bg-slate-100 text-slate-500 cursor-not-allowed" 
                              : "focus:ring-blue-500 focus:border-blue-500 bg-white"
                          )} 
                          value={formData.unitNumber} 
                          onChange={e => setFormData({...formData, unitNumber: e.target.value})} 
                          placeholder="e.g. A-101" 
                        />
                      </div>
                      
                      {/* Phone - Locked if AutoFilled */}
                      <div>
                        <div className="flex justify-between">
                          <label className="block text-xs font-semibold text-blue-700 mb-1">WhatsApp Number</label>
                          {isAutoFilled && <Lock className="w-3 h-3 text-slate-400" />}
                        </div>
                        <input 
                          readOnly={isAutoFilled}
                          className={twMerge(
                            "w-full border border-blue-200 rounded-lg px-3 py-2 text-sm outline-none transition-colors", 
                            isAutoFilled 
                              ? "bg-slate-100 text-slate-500 cursor-not-allowed" 
                              : "focus:ring-blue-500 focus:border-blue-500 bg-white"
                          )} 
                          value={formData.recipientPhone} 
                          onChange={e => setFormData({...formData, recipientPhone: e.target.value})} 
                          placeholder="628..." 
                        />
                      </div>
                   </div>
                 </div>

                 {user.role === 'ADMIN' && (
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Location</label>
                     <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                        <option value="">Select Location</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                     </select>
                   </div>
                 )}
               </div>

               <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                 <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-95">Save & Notify</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DETAIL & ACTION MODAL */}
      {selectedPkg && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => { if(e.target === e.currentTarget) setSelectedPkg(null) }}>
           <div className="bg-white rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="relative h-48 bg-slate-100 group">
                {selectedPkg.photo ? (
                  <img src={selectedPkg.photo} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <PackageIcon className="w-12 h-12 mb-2" />
                    <span className="text-xs font-medium">No photo available</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button onClick={() => setSelectedPkg(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                <div className="absolute bottom-4 left-4">
                   <div className="bg-white/95 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm inline-block mb-1">
                     {selectedPkg.trackingNumber}
                   </div>
                   <div className="text-white text-xs font-medium drop-shadow-md">{selectedPkg.courier} • Size {selectedPkg.size}</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedPkg.recipientName}</h2>
                    <p className="text-slate-500 text-sm font-medium">Unit {selectedPkg.unitNumber}</p>
                    <p className="text-slate-400 text-xs mt-1">{selectedPkg.recipientPhone}</p>
                  </div>
                  <div className="text-right">
                    <div className={twMerge("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block mb-2", 
                        selectedPkg.status === 'ARRIVED' ? "bg-blue-100 text-blue-700" : 
                        selectedPkg.status === 'PICKED' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {selectedPkg.status}
                    </div>
                    <div className="text-xs text-slate-400">Code: <span className="font-mono font-bold text-slate-600">{selectedPkg.pickupCode}</span></div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4 mb-6 relative pl-4 border-l-2 border-slate-100 ml-2">
                   <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                      <p className="text-xs font-bold text-slate-700">Arrived at Location</p>
                      <p className="text-[10px] text-slate-400">{new Date(selectedPkg.dates.arrived).toLocaleString()}</p>
                   </div>
                   {selectedPkg.dates.picked && (
                     <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white" />
                        <p className="text-xs font-bold text-slate-700">Picked Up by Owner</p>
                        <p className="text-[10px] text-slate-400">{new Date(selectedPkg.dates.picked).toLocaleString()}</p>
                     </div>
                   )}
                   {selectedPkg.dates.destroyed && (
                     <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-red-500 ring-4 ring-white" />
                        <p className="text-xs font-bold text-slate-700">Marked as Destroyed</p>
                        <p className="text-[10px] text-slate-400">{new Date(selectedPkg.dates.destroyed).toLocaleString()}</p>
                     </div>
                   )}
                </div>
                
                {/* Fee Calculation Preview if Arrived */}
                {selectedPkg.status === 'ARRIVED' && (() => {
                   const loc = locations.find(l => l.id === selectedPkg.locationId);
                   const cust = customers.find(c => c.phoneNumber === selectedPkg.recipientPhone);
                   const fee = loc ? PricingService.calculateFee(selectedPkg, loc, cust) : 0;
                   return (
                     <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-100 mb-6 flex justify-between items-center">
                       <div>
                         <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">Fee To Pay</p>
                         <p className="text-orange-600 text-xs mt-0.5">{cust?.isMember ? "(Active Member Benefit)" : "(Standard Storage Rate)"}</p>
                       </div>
                       <p className="text-3xl font-bold text-orange-600">Rp {fee.toLocaleString()}</p>
                     </div>
                   )
                })()}

                <div className="grid grid-cols-3 gap-3">
                   {selectedPkg.status === 'ARRIVED' && (
                     <>
                        <button onClick={() => handlePickup(selectedPkg)} className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95">
                            <CheckCircle className="w-4 h-4" /> Pickup Package
                        </button>
                        <button onClick={() => {
                           const loc = locations.find(l => l.id === selectedPkg.locationId);
                           const settings = StorageService.getSettings();
                           if(loc) WhatsAppService.sendNotification(selectedPkg, loc, settings);
                           showToast('success', 'Notifikasi berhasil dikirim ulang!');
                        }} className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-colors">
                            <MessageCircle className="w-5 h-5" />
                        </button>
                     </>
                   )}
                   {selectedPkg.status !== 'DESTROYED' && selectedPkg.status !== 'PICKED' && (
                     <button onClick={() => handleDestroy(selectedPkg)} className="col-span-3 mt-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs py-2 flex items-center justify-center gap-1 transition-colors">
                         <Trash2 className="w-3 h-3" /> Mark as Lost/Destroyed
                     </button>
                   )}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code) => setFormData({...formData, tracking: code})}
      />
    </div>
  );
};

export default Dashboard;
