export interface NavigationItem {
  key: string;
  href: string;
  labelKey: string;
  isExternal?: boolean;
}

export const navigationManifest: NavigationItem[] = [
  { key: 'home', href: '/', labelKey: 'nav.home' },
  { key: 'features', href: '/#features', labelKey: 'nav.features' },
  { key: 'about', href: '/#about', labelKey: 'nav.about' },
  { key: 'contact', href: '/#contact', labelKey: 'nav.contact' },
  { key: 'login', href: '/login', labelKey: 'nav.login' },
  { key: 'register', href: '/register', labelKey: 'nav.register' },
  { key: 'profile', href: '/profile', labelKey: 'nav.profile' },
];
