
export type Role = 'ADMIN' | 'STAFF';
export type PackageStatus = 'ARRIVED' | 'PICKED' | 'DESTROYED';
export type PackageSize = 'S' | 'M' | 'L';
export type PricingType = 'FLAT' | 'PROGRESSIVE' | 'SIZE' | 'QUANTITY';

export interface PricingSchema {
  type: PricingType;
  gracePeriodDays: number;
  flatRate?: number;
  firstDayRate?: number;
  nextDayRate?: number;
  sizeS?: number;
  sizeM?: number;
  sizeL?: number;
  qtyFirst?: number;
  qtyNextRate?: number;
}

export interface Location {
  id: string;
  name: string;
  pricing: PricingSchema;
  enableDelivery: boolean;
  deliveryFee: number;
  enableMembership: boolean;
  membershipFee: number;
}

export interface User {
  id: string;
  username: string;
  password?: string; // In real app, never store plain text
  name: string;
  role: Role;
  locationId?: string;
}

export interface Package {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  unitNumber: string;
  courier: string;
  size: PackageSize;
  locationId: string;
  status: PackageStatus;
  dates: {
    arrived: string; // ISO Date
    picked?: string; // ISO Date
    destroyed?: string; // ISO Date
  };
  feePaid: number;
  paymentTimestamp?: string;
  photo?: string; // Base64 or URL
  notificationStatus: 'PENDING' | 'SENT' | 'FAILED';
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  unitNumber: string;
  locationId: string;
  isMember: boolean;
  membershipExpiry?: string; // ISO Date
}

export interface AppSettings {
  // WA Configuration
  waApiKey: string;
  waSender: string;
  waEndpoint: string;
  
  // Templates
  waTemplatePackage: string; // New regular package
  waTemplateMember: string;  // New member activation
  waTemplateReminder: string; // Reminder h+7
  
  enablePaymentGateway: boolean;
}

export interface DashboardStats {
  packagesIn: number;
  packagesOut: number;
  inventoryActive: number;
  membersActive: number;
  revDelivery: number;
  revMembership: number;
  revPackage: number;
  totalRevenue: number;
}

export type ActivityType = 'LOGIN' | 'PACKAGE_ADD' | 'PACKAGE_UPDATE' | 'PACKAGE_PICKUP' | 'USER_ADD' | 'SETTINGS_UPDATE';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  relatedId?: string; // e.g. packageId
}
