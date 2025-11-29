
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
