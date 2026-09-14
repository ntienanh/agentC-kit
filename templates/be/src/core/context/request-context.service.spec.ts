import { RequestContextService } from './request-context.service';

describe('RequestContextService', () => {
  let service: RequestContextService;

  beforeEach(() => {
    service = new RequestContextService();
  });

  it('should return "no-trace" when no context is set', () => {
    expect(service.getTraceId()).toBe('no-trace');
  });

  it('should provide traceId inside run() callback', () => {
    service.run({ traceId: 'abc-123', userId: 'user-1' }, () => {
      expect(service.getTraceId()).toBe('abc-123');
      expect(service.getUserId()).toBe('user-1');
    });
  });

  it('should return undefined for context outside run()', () => {
    expect(service.getContext()).toBeUndefined();
  });
});
