import type { NextRequest } from 'next/server';
import dayjs from '@/shared/utils/dayjs.util';

export type ApiRouteHandler = (request: NextRequest | Request, ...args: unknown[]) => Promise<Response>;

export function withApiLogging(endpoint: string, handler: ApiRouteHandler): ApiRouteHandler {
  return async (request: NextRequest | Request, ...args: unknown[]) => {
    const startTime = dayjs().valueOf();
    try {
      const response = await handler(request, ...args);
      void (dayjs().valueOf() - startTime);
      return response;
    } catch (error) {
      void (dayjs().valueOf() - startTime);
      throw error;
    }
  };
}
