import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

export interface RequestContext {
  traceId: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

@Injectable()
export class RequestContextService {
  run<T>(context: RequestContext, fn: () => T): T {
    return storage.run(context, fn);
  }

  getContext(): RequestContext | undefined {
    return storage.getStore();
  }

  getTraceId(): string {
    return storage.getStore()?.traceId ?? 'no-trace';
  }

  getUserId(): string | undefined {
    return storage.getStore()?.userId;
  }
}
