import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor (Core Unit Test)', () => {
  let interceptor: TransformInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('nên bọc đối tượng trả về thành công vào chuẩn Success Envelope { success: true, statusCode, data }', (done) => {
    const mockData = { id: '123', email: 'test@example.com' };
    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 201 }),
        getRequest: () => ({ url: '/api/v1/users' }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockData),
    } as unknown as CallHandler<unknown>;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(201);
        expect(result.data).toEqual(mockData);
        expect(result.path).toBe('/api/v1/users');
        expect(result.timestamp).toBeDefined();
        done();
      },
      error: (err: unknown) => {
        done(err);
      },
    });
  });

  it('nên làm phẳng kết quả phân trang (Flattened Pagination) đưa data=[items] và meta lên root level', (done) => {
    const mockPaginatedData = {
      items: [{ id: '1', fullName: 'Alice' }],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
        getRequest: () => ({ url: '/api/v1/users' }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockPaginatedData),
    } as unknown as CallHandler<unknown>;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toEqual(mockPaginatedData.items);
        expect(result.meta).toEqual(mockPaginatedData.meta);
        expect(result.path).toBe('/api/v1/users');
        done();
      },
      error: (err: unknown) => {
        done(err);
      },
    });
  });

  it('không nên bọc lặp nếu dữ liệu đã là ApiSuccessResponse chuẩn', (done) => {
    const mockSuccessResponse = {
      success: true as const,
      statusCode: 200,
      data: { count: 10 },
      timestamp: '2026-08-19T00:00:00.000Z',
      path: '/api/v1/items',
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
        getRequest: () => ({ url: '/api/v1/items' }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockSuccessResponse),
    } as unknown as CallHandler<unknown>;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual(mockSuccessResponse);
        done();
      },
      error: (err: unknown) => {
        done(err);
      },
    });
  });

  it('nên fallback về 200 OK khi response.statusCode không được thiết lập', (done) => {
    const mockData = 'plain string response';
    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({}),
        getRequest: () => ({ url: '/api/v1/test' }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockData),
    } as unknown as CallHandler<unknown>;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result.statusCode).toBe(200);
        expect(result.data).toBe(mockData);
        done();
      },
      error: (err: unknown) => {
        done(err);
      },
    });
  });
});
