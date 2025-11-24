
import { User, Location, AppSettings, Package, Customer } from './types';

export const INITIAL_SETTINGS: AppSettings = {
  waApiKey: "yBMXcDk5iWz9MdEmyu8eBH2uhcytui",
  waSender: "6285777875132",
  waEndpoint: "https://seen.getsender.id/send-message",
  
  waTemplatePackage: "Halo *{name}*,\n\nPaket Anda *{tracking}* telah tiba di *{location}*.\n\nUntuk melihat Kode Ambil dan Rincian Biaya, silakan klik link berikut:\n{link}\n\nTerima kasih.",
  
  waTemplateMember: "Halo *{name}*,\n\nSelamat! Membership Pickpoint Anda di *{location}* telah AKTIF hingga *{expiry}*.\n\nNikmati layanan pengambilan paket GRATIS biaya penyimpanan selama periode membership.\n\nTerima kasih.",
  
  waTemplateReminder: "Halo *{name}*,\n\nReminder: Paket *{tracking}* masih menunggu pengambilan di *{location}*.\n\nHarap segera diambil untuk menghindari penumpukan.\nCek detail: {link}",

  enablePaymentGateway: false
};

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc_1',
    name: 'Apartemen Green View',
    pricing: {
      type: 'FLAT',
      gracePeriodDays: 0,
      flatRate: 2000,
    },
    enableDelivery: true,
    deliveryFee: 5000,
    enableMembership: true,
    membershipFee: 50000
  },
  {
    id: 'loc_2',
    name: 'Metro City Residence',
    pricing: {
      type: 'PROGRESSIVE',
      gracePeriodDays: 0,
      firstDayRate: 3000,
      nextDayRate: 5000
    },
    enableDelivery: false,
    deliveryFee: 0,
    enableMembership: false,
    membershipFee: 0
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    username: 'admin',
    password: 'password',
    name: 'Super Admin',
    role: 'ADMIN'
  },
  {
    id: 'user_staff',
    username: 'staff',
    password: 'password',
    name: 'Staff Green View',
    role: 'STAFF',
    locationId: 'loc_1'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'John Doe',
    phoneNumber: '628123456789',
    unitNumber: 'A-101',
    locationId: 'loc_1',
    isMember: true,
    membershipExpiry: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
  }
];

export const COURIER_OPTIONS = ['JNE', 'J&T', 'SiCepat', 'GoSend', 'GrabExpress', 'ShopeeXpress', 'Lazada', 'Paxel'];

export const SEED_KEYS = {
  USERS: 'pp_users',
  LOCATIONS: 'pp_locations',
  PACKAGES: 'pp_packages',
  CUSTOMERS: 'pp_customers',
  SETTINGS: 'pp_settings'
};
