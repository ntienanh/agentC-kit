import dayjs from '@/shared/utils/dayjs.util';

export function createRequestId(prefix = 'fo') {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return `${prefix}-${cryptoApi.randomUUID()}`;
  return `${prefix}-${dayjs().valueOf()}-${Math.random().toString(16).slice(2)}`;
}
