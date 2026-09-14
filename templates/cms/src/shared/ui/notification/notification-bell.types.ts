export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  createdAt?: string | Date;
  read: boolean;
  type: 'lead' | 'sample' | 'support' | 'system';
  actionUrl?: string;
  storeId?: string;
}
