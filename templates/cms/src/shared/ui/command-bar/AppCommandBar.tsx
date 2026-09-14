'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useAppRouter } from '@/shared/hooks/navigation/useAppRouter';
import { Input, Modal, type InputRef } from 'antd';
import {
  CornerDownLeft,
  Key,
  LayoutDashboard,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface CommandItem {
  key: string;
  title: string;
  category: string;
  href: string;
  icon: React.ReactNode;
  shortcut?: string;
}

const ALL_DESTINATIONS: CommandItem[] = [
  {
    key: 'dashboard',
    title: 'Dashboard Overview',
    category: 'Overview',
    href: APP_HREFS.DASHBOARD,
    icon: <LayoutDashboard size={15} />,
  },
  {
    key: 'users',
    title: 'Users & Staff Directory',
    category: 'Security',
    href: APP_HREFS.USERS,
    icon: <Users size={15} />,
  },
  {
    key: 'roles',
    title: 'Roles Matrix',
    category: 'Security',
    href: APP_HREFS.ROLES,
    icon: <ShieldCheck size={15} />,
  },
  {
    key: 'permissions',
    title: 'Permissions Catalog',
    category: 'Security',
    href: APP_HREFS.PERMISSIONS,
    icon: <Key size={15} />,
  },
  {
    key: 'profile',
    title: 'My Account Profile',
    category: 'Account',
    href: APP_HREFS.PROFILE,
    icon: <UserCheck size={15} />,
  },
];

export function AppCommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(true);
  const router = useAppRouter();
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().includes('MAC'));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return ALL_DESTINATIONS;
    const lower = query.toLowerCase();
    return ALL_DESTINATIONS.filter(
      item => item.title.toLowerCase().includes(lower) || item.category.toLowerCase().includes(lower),
    );
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex].href);
    }
  };

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='group border-border/60 bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground hover:border-border/80 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-between gap-3 rounded-lg border px-2 text-start text-xs shadow-2xs transition-all duration-200 sm:h-8.5 sm:w-auto sm:min-w-[170px] sm:px-3 md:min-w-[200px]'
        aria-label='Search'
      >
        <span className='flex min-w-0 items-center gap-2 truncate'>
          <Search size={14} className='text-muted-foreground group-hover:text-foreground shrink-0 transition-colors' />
          <span className='text-muted-foreground group-hover:text-foreground hidden truncate text-xs font-normal transition-colors sm:inline'>
            Search
          </span>
        </span>
        <kbd className='border-border/70 bg-background/80 text-muted-foreground group-hover:text-foreground pointer-events-none hidden h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium shadow-2xs transition-colors select-none sm:inline-flex'>
          {isMac ? '⌘K' : 'Ctrl K'}
        </kbd>
      </button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        closable={false}
        centered
        width={520}
        styles={{ body: { padding: 0 } }}
        className='app-command-modal overflow-hidden'
      >
        <div
          onKeyDown={handleModalKeyDown}
          className='surface-glass border-border/50 bg-card/95 flex flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl'
        >
          <div className='border-border/40 bg-muted/20 flex items-center gap-2.5 border-b px-3.5 py-2.5'>
            <Search size={16} className='text-muted-foreground shrink-0' />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Search pages...'
              variant='borderless'
              className='placeholder:text-muted-foreground/50 p-0 text-sm font-normal focus:shadow-none'
              autoFocus
            />
            <kbd className='border-border/60 text-muted-foreground bg-muted/40 shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px]'>
              ESC
            </kbd>
          </div>

          <div className='max-h-[340px] scrollbar-thin space-y-0.5 overflow-y-auto p-1.5'>
            {filteredItems.length === 0 ? (
              <div className='text-muted-foreground py-8 text-center text-xs'>
                No matching page found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.key}
                    type='button'
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-start transition-all duration-100 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-medium shadow-xs'
                        : 'hover:bg-accent/60 text-foreground'
                    }`}
                  >
                    <div className='flex min-w-0 items-center gap-2.5'>
                      <span className={`shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                        {item.icon}
                      </span>
                      <span className='truncate text-xs sm:text-sm'>{item.title}</span>
                    </div>

                    <div className='ms-2 flex shrink-0 items-center gap-2'>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                          isSelected
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {item.category}
                      </span>
                      {isSelected && <CornerDownLeft size={12} className='text-primary-foreground opacity-90' />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className='border-border/40 bg-muted/20 text-muted-foreground flex items-center justify-between border-t px-3.5 py-1.5 text-[11px] font-medium'>
            <div className='flex items-center gap-3'>
              <span className='flex items-center gap-1'>
                <kbd className='border-border/60 bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]'>
                  ↑↓
                </kbd>{' '}
                Navigate
              </span>
              <span className='flex items-center gap-1'>
                <kbd className='border-border/60 bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]'>
                  ↵
                </kbd>{' '}
                Select
              </span>
              <span className='flex items-center gap-1'>
                <kbd className='border-border/60 bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]'>
                  esc
                </kbd>{' '}
                Close
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
