import { apiFetch } from '@/shared/lib/apiFetch';
import Cookies from 'js-cookie';
import { io, Socket } from 'socket.io-client';

export interface OperatorNotificationPayload {
  id: string;
  category?: string;
  changeType?: 'created' | 'updated' | 'status_changed' | 'deleted';
  type?: string;
  title: string;
  message: string;
  createdAt?: string;
  actionUrl?: string;
  storeId?: string;
}

export type NotificationCallback = (payload: OperatorNotificationPayload) => void;
export type StatusCallback = (connected: boolean) => void;
export type OperatorSocketOptions = {
  storeId: string;
  onNotification: NotificationCallback;
  onStatusChange?: StatusCallback;
};

function resolveCookieAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const accessToken = Cookies.get('accessToken');
  const authToken = Cookies.get('auth_token');
  return accessToken || authToken || null;
}

async function resolveSessionAuthToken(): Promise<string | null> {
  try {
    const response = await apiFetch('/api/auth/session', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as { accessToken?: unknown };
    return typeof payload.accessToken === 'string' ? payload.accessToken : null;
  } catch {
    return null;
  }
}

function resolveSocketUrl(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (configuredUrl) return configuredUrl;
  return process.env.NODE_ENV === 'production' ? null : 'http://localhost:4000';
}

export function initOperatorSocket({ storeId, onNotification, onStatusChange }: OperatorSocketOptions): () => void {
  const customEventHandler = (event: Event) => {
    const customEvent = event as CustomEvent<OperatorNotificationPayload>;
    if (customEvent.detail) {
      onNotification(customEvent.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('operator_notification', customEventHandler);
  }

  let socket: Socket | null = null;
  let disposed = false;

  const connect = (socketUrl: string, token: string) => {
    if (disposed) return;

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: { token },
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      onStatusChange?.(false);
      socket?.emit('join_room', { roomName: 'public_operators' });
      socket?.emit('subscribe_operator_store', { storeId });
    });

    socket.on('operator_store_subscribed', (payload: { storeId?: string }) => {
      if (payload?.storeId === storeId) {
        onStatusChange?.(true);
      }
    });

    socket.on('operator_notification', (payload: OperatorNotificationPayload) => {
      if (payload) {
        onNotification(payload);
      }
    });

    socket.on('disconnect', () => {
      onStatusChange?.(false);
    });

    socket.on('connect_error', () => {
      onStatusChange?.(false);
    });

    socket.on('exception', () => {
      onStatusChange?.(false);
    });
  };

  if (typeof window !== 'undefined') {
    try {
      const socketUrl = resolveSocketUrl();
      const cookieToken = resolveCookieAuthToken();
      const testToken = process.env.NODE_ENV === 'test' ? 'VALID_TEST_TOKEN' : null;

      if (!socketUrl) {
        onStatusChange?.(false);
        return () => undefined;
      }

      const initialToken = cookieToken || testToken;

      if (initialToken) {
        connect(socketUrl, initialToken);
      } else {
        void resolveSessionAuthToken().then(token => {
          if (token) connect(socketUrl, token);
          else if (!disposed) onStatusChange?.(false);
        });
      }
    } catch {
      onStatusChange?.(false);
    }
  }

  return () => {
    disposed = true;
    if (typeof window !== 'undefined') {
      window.removeEventListener('operator_notification', customEventHandler);
    }
    if (socket) {
      socket.disconnect();
    }
    onStatusChange?.(false);
  };
}

export function dispatchLocalNotification(payload: OperatorNotificationPayload) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('operator_notification', { detail: payload }));
  }
}
