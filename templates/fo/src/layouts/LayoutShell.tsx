'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  ChevronDown,
  LogIn,
  Menu,
  X,
} from 'lucide-react';
import type { LoginResponse } from '@/features/auth/api';
import { useFoSession } from '@/features/auth/use-fo-session';
import { Shimmer } from '@/shared/ui/Shimmer';
import { AmbientBackground } from './AmbientBackground';
import { AppLogo } from '@/shared/ui/AppLogo';
import dayjs from '@/shared/utils/dayjs.util';

interface LayoutShellProps {
  children: React.ReactNode;
}

interface SubNavItem {
  label: string;
  href: string;
  desc?: string;
}

interface NavItem {
  label: string;
  href: string;
  submenu: SubNavItem[];
}

const mainNavLinks: NavItem[] = [
  {
    label: 'Features',
    href: '/#features',
    submenu: [],
  },
  {
    label: 'About',
    href: '/#about',
    submenu: [],
  },
  {
    label: 'Contact',
    href: '/#contact',
    submenu: [],
  },
];

const secondaryMenuLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Profile', href: '/profile' },
];

const footerMenuLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Profile', href: '/profile' },
];

function isHrefActive(pathname: string, href: string) {
  if (href.startsWith('/#')) return false;
  return pathname === href.split('#')[0];
}

const enterpriseContactProfile = {
  days: 'Monday - Friday',
  hours: '09:00 AM - 06:00 PM EST',
  phone: '+1 (555) 019-2834',
  email: 'support@example.com',
  address: '100 Enterprise Way, Suite 400 - San Francisco, CA',
};

const chromelessAuthPaths = ['/login', '/register'];

function HeaderAuthDesktopPlaceholder() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="h-11 w-28 rounded-full bg-muted/70 animate-pulse" />
      <div className="h-11 w-11 rounded-full bg-muted/70 animate-pulse" />
    </div>
  );
}

function HeaderAuthMobilePlaceholder() {
  return <div className="h-11 w-24 rounded-full bg-muted/70 animate-pulse" aria-hidden="true" />;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authMenuOpen, setAuthMenuOpen] = useState<boolean>(false);
  const { session, hasHydratedSession, setSession } = useFoSession();
  const authRef = useRef<HTMLDivElement>(null);

  const isLinkActive = (link: NavItem) => {
    if (link.href === '/' && pathname !== '/') return false;
    if (pathname === link.href) return true;
    return link.submenu.some((sub) => isHrefActive(pathname, sub.href)) || pathname.startsWith(link.href);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (authRef.current && !authRef.current.contains(event.target as Node)) {
        setAuthMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const handleLogout = () => {
    setSession(null);
    window.location.reload();
  };

  const getInitials = () => {
    if (!session) return '';
    const user = session.user as { name?: string; email: string };
    const name = user.name || user.email.split('@')[0];
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const user = hasHydratedSession ? (session?.user as { name?: string; email: string; avatar?: string } | undefined) : undefined;
  const isAuthenticated = hasHydratedSession && Boolean(session && user);
  const footerActionHref = isAuthenticated ? '/profile' : '/login';
  const isChromelessAuthPage = chromelessAuthPaths.some((p) => pathname.endsWith(p));

  if (isChromelessAuthPage) {
    return <>{children}</>;
  }

  const authButton = isAuthenticated ? (
    <div ref={authRef} className="relative py-2">
      <button
        type="button"
        onClick={() => setAuthMenuOpen((open) => !open)}
        className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10 ${
          authMenuOpen
            ? 'border-accent bg-accent/20 text-accent shadow-xs scale-105'
            : 'border-border/80 bg-accent/15 text-accent'
        }`}
        aria-label="Open account menu"
        aria-expanded={authMenuOpen}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="Profile avatar" className="h-full w-full object-cover" />
        ) : (
          <span>{getInitials()}</span>
        )}
      </button>

      <div
        className={`absolute top-full right-0 mt-2 w-48 bg-card border border-border/80 rounded-2xl shadow-xl p-1.5 z-50 transition-all duration-500 ease-out ${
          authMenuOpen
            ? 'opacity-100 translate-y-0 visible pointer-events-auto'
            : 'opacity-0 -translate-y-3 invisible pointer-events-none'
        }`}
      >
        <div className="px-3 py-2 border-b border-border/40 mb-1 select-none">
          <p className="text-xs font-bold text-foreground truncate">{user?.name || 'User'}</p>
          <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Link
          href="/profile"
          onClick={() => setAuthMenuOpen(false)}
          className="block px-3.5 py-2 text-sm hover:bg-muted/40 rounded-xl transition-colors text-foreground font-semibold"
        >
          My Profile
        </Link>
        <a
          href="http://localhost:3333"
          target="_blank"
          rel="noreferrer"
          onClick={() => setAuthMenuOpen(false)}
          className="block px-3.5 py-2 text-sm hover:bg-muted/40 rounded-xl transition-colors text-foreground font-semibold"
        >
          Admin CMS ↗
        </a>
        <button
          type="button"
          onClick={() => {
            setAuthMenuOpen(false);
            handleLogout();
          }}
          className="w-full text-left block px-3.5 py-2 text-sm hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer font-bold"
        >
          Log Out
        </button>
      </div>
    </div>
  ) : (
    <div className="hidden sm:flex items-center gap-2">
      <Link
        href="/register"
        className="flex h-11 items-center rounded-full border border-border px-4 text-xs font-bold text-foreground transition-all hover:bg-muted hover:scale-105 active:scale-95"
      >
        Register
      </Link>
      <Link
        href="/login"
        className="flex h-11 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-bold text-background transition-all hover:bg-foreground/90 hover:scale-105 active:scale-95"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>Sign In</span>
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <AmbientBackground />

      <div className="w-full bg-secondary/50 border-b border-border/40 text-muted-foreground text-center py-1.5 px-4 sm:px-6 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium select-none relative z-46">
        <span className="hidden sm:inline-flex bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full select-none">Notice</span>
        <span className="truncate">Enterprise Platform v2.0 is live. Explore modular architecture and integrations.</span>
        <Link href="/#features" className="ml-1.5 underline hover:text-foreground transition-colors cursor-pointer font-semibold">
          Learn More
        </Link>
      </div>

      <header className="sticky top-0 z-45 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="container-premium flex h-16 items-center justify-between gap-4">
          <Link href="/" className="shrink-0 flex items-center">
            <AppLogo size={32} showText={true} />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 font-medium text-muted-foreground relative">
            {mainNavLinks.map((link) => {
              const hasSubmenu = link.submenu.length > 0;

              return (
                <div key={link.label} className="relative group py-5">
                  <Link
                    href={link.href}
                    className={`inline-flex min-h-11 items-center gap-1.5 transition-colors text-sm font-semibold cursor-pointer relative z-10 ${
                      isLinkActive(link) ? 'text-accent font-bold' : 'hover:text-foreground text-muted-foreground'
                    }`}
                  >
                    <span className="relative py-1">
                      {link.label}
                      <span
                        className={`absolute bottom-0 left-0 h-[2px] bg-accent rounded-full transition-all duration-300 ${
                          isLinkActive(link) ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      />
                    </span>
                    {hasSubmenu ? (
                      <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" aria-hidden="true" />
                    ) : null}
                  </Link>

                  {hasSubmenu ? (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-80 z-50 opacity-0 -translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 ease-out pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-card border border-border/80 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-md">
                        {link.submenu.map((sub) => {
                          const isSubActive = isHrefActive(pathname, sub.href);

                          return (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              scroll={true}
                              onClick={() => {
                                if (typeof window !== 'undefined') {
                                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                                }
                              }}
                              className={`group/item flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 ${
                                isSubActive
                                  ? 'bg-accent/12 text-accent font-bold shadow-xs'
                                  : 'hover:bg-accent/8 hover:translate-x-1 text-foreground'
                              }`}
                            >
                              <div>
                                <span
                                  className={`block text-xs transition-colors ${
                                    isSubActive ? 'font-bold text-accent' : 'font-semibold text-foreground group-hover/item:text-accent'
                                  }`}
                                >
                                  {sub.label}
                                </span>
                                <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">
                                  {sub.desc}
                                </span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-accent opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {hasHydratedSession ? (
              <>
                {isAuthenticated ? (
                  <Link
                    href="/profile"
                    className="relative isolate overflow-hidden bg-accent text-white font-bold text-xs rounded-full px-5 h-11 hover:bg-accent-press transition-all hover:scale-105 active:scale-95 shadow-md shadow-accent/25 cursor-pointer flex items-center gap-1.5 shrink-0 group"
                  >
                    <Shimmer opacity="accent" />
                    <span className="relative z-10 select-none text-white">Profile</span>
                  </Link>
                ) : null}

                {authButton}
              </>
            ) : (
              <HeaderAuthDesktopPlaceholder />
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            {hasHydratedSession ? (
              isAuthenticated ? (
                <Link href="/profile" className="relative isolate overflow-hidden flex h-11 items-center rounded-full bg-accent px-4 text-xs font-bold text-white shadow-md shadow-accent/20 group">
                  <Shimmer opacity="accent" />
                  <span className="relative z-10 select-none text-white">Profile</span>
                </Link>
              ) : (
                <Link href="/login" className="flex h-11 items-center rounded-full bg-foreground px-4 text-xs font-bold text-background shadow-md shadow-foreground/10">
                  Sign In
                </Link>
              )
            ) : (
              <HeaderAuthMobilePlaceholder />
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted/40 cursor-pointer"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-card p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
            <nav className="grid gap-2">
              {mainNavLinks.map((link) => {
                return (
                  <div key={link.label} className="space-y-1">
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-10 items-center rounded-xl px-4 text-sm font-bold transition-colors ${isLinkActive(link) ? 'text-accent bg-accent/5' : 'text-foreground hover:bg-muted/40'}`}
                    >
                      {link.label}
                    </Link>
                  </div>
                );
              })}
            </nav>

            {!hasHydratedSession || !session ? (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-full border border-border text-center text-xs font-bold text-foreground"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-foreground text-center text-xs font-bold text-background"
                >
                  Sign In
                </Link>
              </div>
            ) : null}

            <div className="h-px bg-border/40" />

            <div className="grid grid-cols-2 gap-1">
              {secondaryMenuLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-4 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/60"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {hasHydratedSession && session ? (
              <>
                <div className="h-px bg-border/40" />
                <div className="grid gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 w-full items-center justify-center rounded-full border border-border text-center text-xs font-bold text-foreground"
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex h-11 w-full items-center justify-center rounded-full bg-red-50 text-center text-xs font-bold text-red-600 cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </header>

      <div className="flex-1">{children}</div>

      <footer className="w-full bg-primary py-10 sm:py-16 text-primary-foreground">
        <div className="container-premium">
          <div className="grid gap-8 sm:gap-10 border-b border-white/14 pb-8 sm:pb-10 lg:grid-cols-[1.05fr_0.72fr_1.2fr] lg:gap-16">
            <section className="space-y-5 sm:space-y-7">
              <Link href="/" className="inline-flex items-center gap-3">
                <AppLogo size={30} showText={true} />
              </Link>
              <div className="max-w-sm space-y-4 sm:space-y-5">
                <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white">
                  Experience modern, secure enterprise management.
                </h2>
                <Link
                  href={footerActionHref}
                  className="relative overflow-hidden group inline-flex h-12 sm:h-14 items-center gap-3 sm:gap-4 rounded-full bg-accent py-1 pl-5 sm:pl-6 pr-1 sm:pr-1.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-black/20 transition-all hover:scale-102 hover:bg-accent-press"
                >
                  <Shimmer opacity="accent" />
                  <span className="relative z-10 text-white">Get Started</span>
                  <span className="relative z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-primary text-white">
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </section>

            <section className="space-y-4 sm:space-y-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">Operating Hours</p>
                <div className="mt-2 sm:mt-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm leading-relaxed text-white/78">
                  <p>{enterpriseContactProfile.days}</p>
                  <p className="font-semibold text-white">{enterpriseContactProfile.hours}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-white/45">Phone</p>
                  <a href={`tel:${enterpriseContactProfile.phone.replace(/[^\d+]/g, '')}`} className="mt-0.5 inline-flex items-center text-xs sm:text-sm font-semibold text-white transition-colors hover:text-accent">
                    {enterpriseContactProfile.phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-white/45">Email</p>
                  <a href={`mailto:${enterpriseContactProfile.email}`} className="mt-0.5 inline-flex items-center text-xs sm:text-sm font-semibold text-white transition-colors hover:text-accent">
                    {enterpriseContactProfile.email}
                  </a>
                </div>
              </div>
            </section>

            <section className="space-y-4 sm:space-y-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">Headquarters</p>
                <p className="mt-2 sm:mt-5 font-display text-xl sm:text-3xl font-semibold leading-tight text-white">Enterprise Headquarters</p>
                <div className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-3 text-xs sm:text-sm leading-relaxed text-white/72">
                  <p>{enterpriseContactProfile.address}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-4 pt-6 text-xs text-white/46 lg:grid-cols-[1fr_auto] lg:items-center">
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 lg:justify-start">
              {footerMenuLinks.map((link) => (
                <Link key={link.label} href={link.href} className="inline-flex min-h-9 items-center transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
              <Link href="/#" className="inline-flex min-h-9 items-center transition-colors hover:text-white">Terms &amp; Conditions</Link>
              <Link href="/#" className="inline-flex min-h-9 items-center transition-colors hover:text-white">Privacy Policy</Link>
              <Link href="/#faq" className="inline-flex min-h-9 items-center transition-colors hover:text-white">FAQ</Link>
            </nav>
            <p className="text-center lg:text-right">&copy; {dayjs().year()} Enterprise Client Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
