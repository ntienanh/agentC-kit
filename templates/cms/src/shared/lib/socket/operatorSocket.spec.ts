import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initOperatorSocket } from './operatorSocket';

const socketMock = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => socketMock),
}));

describe('operatorSocket', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    vi.clearAllMocks();
    socketMock.on.mockReset();
    socketMock.emit.mockReset();
    socketMock.disconnect.mockReset();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  });

  it('subscribes to the selected store and disconnects cleanly', async () => {
    const { io } = await import('socket.io-client');
    const cleanup = initOperatorSocket({
      storeId: 'store-1',
      onNotification: vi.fn(),
      onStatusChange: vi.fn(),
    });
    const connectHandler = socketMock.on.mock.calls.find(([event]) => event === 'connect')?.[1];

    connectHandler?.();

    expect(io).toHaveBeenCalled();
    expect(socketMock.emit).toHaveBeenCalledWith('join_room', { roomName: 'public_operators' });
    expect(socketMock.emit).toHaveBeenCalledWith('subscribe_operator_store', { storeId: 'store-1' });

    cleanup();
    expect(socketMock.disconnect).toHaveBeenCalled();
  });

  it('reports ready only after the selected store room confirms its subscription', () => {
    const onStatusChange = vi.fn();
    const cleanup = initOperatorSocket({
      storeId: 'store-1',
      onNotification: vi.fn(),
      onStatusChange,
    });
    const connectHandler = socketMock.on.mock.calls.find(([event]) => event === 'connect')?.[1];
    const subscribedHandler = socketMock.on.mock.calls.find(([event]) => event === 'operator_store_subscribed')?.[1];

    connectHandler?.();
    expect(onStatusChange).toHaveBeenLastCalledWith(false);

    subscribedHandler?.({ storeId: 'store-1' });
    expect(onStatusChange).toHaveBeenLastCalledWith(true);

    cleanup();
  });

  it('retrieves the httpOnly-backed session token before opening the socket', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'session-token' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { io } = await import('socket.io-client');

    const cleanup = initOperatorSocket({ storeId: 'store-1', onNotification: vi.fn() });

    await vi.waitFor(() => {
      expect(io).toHaveBeenCalledWith(
        'http://localhost:4000',
        expect.objectContaining({ auth: { token: 'session-token' }, withCredentials: true }),
      );
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/session', {
      credentials: 'include',
      cache: 'no-store',
    });

    cleanup();
  });

  it('subscribes again when a replacement listener is created for a new active store', () => {
    const firstCleanup = initOperatorSocket({ storeId: 'store-1', onNotification: vi.fn() });
    const firstConnectHandler = socketMock.on.mock.calls.find(([event]) => event === 'connect')?.[1];
    firstConnectHandler?.();
    firstCleanup();

    socketMock.on.mockReset();
    const secondCleanup = initOperatorSocket({ storeId: 'store-2', onNotification: vi.fn() });
    const secondConnectHandler = socketMock.on.mock.calls.find(([event]) => event === 'connect')?.[1];
    secondConnectHandler?.();

    expect(socketMock.emit).toHaveBeenCalledWith('subscribe_operator_store', { storeId: 'store-1' });
    expect(socketMock.emit).toHaveBeenCalledWith('subscribe_operator_store', { storeId: 'store-2' });
    secondCleanup();
  });
});
