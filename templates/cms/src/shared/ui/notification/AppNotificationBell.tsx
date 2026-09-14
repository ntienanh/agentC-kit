'use client';

import { isNotificationItemRead } from '@/shared/models/notification-contract';
import { AppStatusTag } from '../status/AppStatusTag';
import { Badge, Button, Modal, Popover, Tooltip } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Boxes, CheckCheck, Flame, Loader2, MessageSquare, ShieldAlert } from 'lucide-react';
import type { NotificationItem } from './notification-bell.types';
import { formatNotificationTime } from './notification-bell.utils';
import { useAppNotificationBell } from './useAppNotificationBell';

export type { NotificationItem } from './notification-bell.types';

function getItemTypeStyles(type: NotificationItem['type'], read: boolean) {
  if (read) {
    return {
      container: 'bg-card/50 border-border/40 hover:bg-muted/30 text-muted-foreground',
      iconContainer: 'bg-muted/30 text-muted-foreground border-border/30',
      icon: <Bell size={15} />,
    };
  }

  const styles = {
    lead: {
      container: 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 text-foreground shadow-2xs',
      iconContainer: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: <Flame size={15} className='animate-pulse' />,
    },
    sample: {
      container: 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 text-foreground shadow-2xs',
      iconContainer: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: <Boxes size={15} />,
    },
    support: {
      container: 'bg-sky-500/5 border-sky-500/20 hover:bg-sky-500/10 text-foreground shadow-2xs',
      iconContainer: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      icon: <MessageSquare size={15} />,
    },
    system: {
      container: 'bg-primary/5 border-primary/20 hover:bg-primary/10 text-foreground shadow-2xs',
      iconContainer: 'bg-primary/15 text-primary border-primary/30',
      icon: <ShieldAlert size={15} />,
    },
  };

  return styles[type];
}

export function AppNotificationBell() {
  const {
    handleItemClick,
    handleOpenChange,
    handleScroll,
    handleSelectedNotificationAction,
    isConnected,
    isFetchingNextPage,
    isRinging,
    listRef,
    markAllAsRead,
    notifications,
    popoverOpen,
    selectedNotification,
    setSelectedNotification,
    unreadCount,
  } = useAppNotificationBell();

  const popoverContent = (
    <div className='w-96 space-y-3 p-1 sm:w-[420px]'>
      <div className='border-border/50 flex items-center justify-between border-b px-1 pb-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <div className='bg-primary/10 text-primary relative shrink-0 rounded-xl p-2'>
            <Bell size={16} />
            {isConnected && (
              <span title='Live Socket Connected' className='ring-background absolute -top-0.5 -right-0.5 h-2 w-2 animate-pulse rounded-full bg-emerald-500 ring-2' />
            )}
          </div>
          <div className='flex min-w-0 items-center gap-2'>
            <span className='text-foreground text-sm font-bold tracking-tight'>Notifications</span>
            {unreadCount > 0 && (
              <AppStatusTag tone='primary' size='sm' className='shrink-0 font-extrabold shadow-2xs'>
                {unreadCount} new
              </AppStatusTag>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <Tooltip title='Mark all as read'>
            <Button
              type='text'
              size='small'
              onClick={markAllAsRead}
              icon={<CheckCheck size={15} className='text-muted-foreground hover:text-foreground' />}
              className='text-muted-foreground hover:bg-muted h-8 w-8 shrink-0 rounded-lg'
            />
          </Tooltip>
        )}
      </div>

      <div ref={listRef} onScroll={handleScroll} className='max-h-96 scrollbar-thin space-y-2 overflow-y-auto pe-1.5'>
        {notifications.length === 0 ? (
          <div className='space-y-2 py-12 text-center'>
            <div className='bg-muted/30 border-border/40 text-muted-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border'>
              <Bell size={22} />
            </div>
            <p className='text-muted-foreground m-0 text-xs font-medium'>No notifications available.</p>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {notifications.map((item: NotificationItem) => {
                const isRead = isNotificationItemRead(item);
                const styles = getItemTypeStyles(item.type, isRead);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    onClick={() => handleItemClick(item)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all duration-200 ${styles.container}`}
                  >
                    <div className='flex min-w-0 items-start gap-3'>
                      <div className={`mt-0.5 shrink-0 rounded-xl border p-2 ${styles.iconContainer}`}>{styles.icon}</div>
                      <div className='min-w-0 flex-1 space-y-1'>
                        <div className='flex items-center justify-between gap-2'>
                          <div className='flex min-w-0 items-center gap-1.5'>
                            {!isRead && <span className='bg-primary h-2 w-2 shrink-0 animate-pulse rounded-full' />}
                            <span className={`min-w-0 truncate text-xs ${isRead ? 'text-muted-foreground font-medium' : 'text-foreground font-bold'}`}>
                              {item.title}
                            </span>
                          </div>
                          <span className='text-muted-foreground/80 shrink-0 font-mono text-xs font-medium'>
                            {formatNotificationTime(item.createdAt, item.time)}
                          </span>
                        </div>
                        <p className='text-muted-foreground m-0 line-clamp-2 text-xs leading-relaxed font-normal'>{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isFetchingNextPage && (
              <div className='text-primary flex animate-pulse items-center justify-center gap-2 py-3 text-center font-mono text-xs'>
                <Loader2 size={15} className='animate-spin' />
                <span>Loading cursor page...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Popover content={popoverContent} trigger='click' placement='bottomRight' arrow={false} open={popoverOpen} onOpenChange={handleOpenChange}>
        <div className='flex items-center justify-center'>
          <Badge count={unreadCount} overflowCount={99} size='small' offset={[-6, 6]}>
            <Button
              type='text'
              icon={
                <motion.div
                  animate={isRinging ? { rotate: [0, -18, 18, -12, 12, -6, 0] } : { rotate: 0 }}
                  transition={isRinging ? { duration: 0.85, ease: 'easeInOut', repeat: 4 } : { duration: 0.2 }}
                >
                  <Bell size={18} className={`transition-colors duration-200 ${unreadCount > 0 ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`} />
                </motion.div>
              }
              className='border-border/50 hover:bg-muted/60 flex h-9 w-9 items-center justify-center rounded-xl border'
              aria-label='Notifications'
            />
          </Badge>
        </div>
      </Popover>

      <Modal
        open={Boolean(selectedNotification)}
        onCancel={() => setSelectedNotification(null)}
        footer={null}
        title={<div className='flex items-center gap-2'><div className='bg-primary/10 text-primary rounded-lg p-1.5'><Bell size={16} /></div><span className='text-sm font-bold'>Notification Inspector</span></div>}
        centered
        width={480}
      >
        {selectedNotification && (
          <div className='space-y-4 pt-2 text-xs'>
            <div className='border-border/40 flex items-center justify-between gap-2 border-b pb-3'>
              <AppStatusTag tone={selectedNotification.type === 'lead' ? 'warning' : selectedNotification.type === 'sample' ? 'success' : selectedNotification.type === 'support' ? 'info' : 'primary'} size='sm'>
                {selectedNotification.type.toUpperCase()}
              </AppStatusTag>
              <span className='text-muted-foreground font-mono'>{selectedNotification.time}</span>
            </div>
            <div className='space-y-1.5'>
              <h4 className='text-foreground m-0 text-sm font-bold'>{selectedNotification.title}</h4>
              <p className='text-muted-foreground m-0 text-xs leading-relaxed'>{selectedNotification.description}</p>
            </div>
            <div className='bg-muted/30 border-border/40 space-y-2 rounded-xl border p-3.5 font-mono text-xs'>
              <div className='text-muted-foreground flex justify-between'><span>Notification ID:</span><span className='text-foreground font-bold'>{selectedNotification.id}</span></div>
              <div className='text-muted-foreground flex justify-between'><span>Delivery Status:</span><span className='font-bold text-emerald-600 dark:text-emerald-400'>DELIVERED</span></div>
              <div className='text-muted-foreground flex justify-between'><span>Read State:</span><span className={selectedNotification.read ? 'text-muted-foreground font-medium' : 'text-primary font-bold'}>{selectedNotification.read ? 'READ' : 'UNREAD'}</span></div>
            </div>
            <div className='border-border/40 flex justify-end gap-2 border-t pt-2'>
              {selectedNotification.actionUrl && <Button type='primary' onClick={handleSelectedNotificationAction} className='rounded-xl'>Jump to Feature Page</Button>}
              <Button onClick={() => setSelectedNotification(null)} className='rounded-xl'>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
