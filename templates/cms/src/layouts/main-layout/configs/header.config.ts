export interface HeaderNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export const HEADER_MENU_KEYS = {
  PROFILE: 'profile',
  CHANGE_PASSWORD: 'change-password',
} as const;
