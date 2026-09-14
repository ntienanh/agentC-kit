import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { RequestContextService } from './request-context.service';

export const TRACE_ID_HEADER = 'x-trace-id';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  constructor(private readonly contextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const traceId = (req.headers[TRACE_ID_HEADER] as string) || randomUUID();

    res.setHeader(TRACE_ID_HEADER, traceId);

    const context = {
      traceId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    this.contextService.run(context, () => next());
  }
}
