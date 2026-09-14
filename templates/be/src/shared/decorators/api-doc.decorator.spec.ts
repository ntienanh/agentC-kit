import { Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiDoc } from './api-doc.decorator';
import { ErrorCode } from '@shared/enums';

class SampleDto {
  name: string;
}

@Controller('test-doc')
class TestDocController {
  @Get('standard')
  @ApiDoc({
    summary: 'Standard Endpoint',
    description: 'Detailed description',
    response: SampleDto,
    status: HttpStatus.OK,
    auth: true,
  })
  standardMethod() {
    return { name: 'test' };
  }

  @Post('created')
  @ApiDoc({
    summary: 'Create Endpoint',
    response: SampleDto,
    status: HttpStatus.CREATED,
    auth: false,
    errors: [
      HttpStatus.BAD_REQUEST,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.FORBIDDEN,
      HttpStatus.NOT_FOUND,
      HttpStatus.CONFLICT,
      HttpStatus.INTERNAL_SERVER_ERROR,
      503,
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Custom validation msg',
        errorCode: ErrorCode.VALIDATION_FAILED,
      },
      {
        status: HttpStatus.FORBIDDEN,
        errorCode: ErrorCode.FORBIDDEN,
      },
    ],
  })
  createMethod() {
    return {};
  }

  @Get('paginated')
  @ApiDoc({
    summary: 'Paginated Endpoint',
    response: SampleDto,
    isPaginated: true,
  })
  paginatedMethod() {
    return [];
  }

  @Get('array')
  @ApiDoc({
    summary: 'Array Endpoint',
    response: SampleDto,
    isArray: true,
  })
  arrayMethod() {
    return [];
  }

  @Get('raw')
  @ApiDoc({
    summary: 'Raw Endpoint',
    response: SampleDto,
    rawResponse: true,
    isArray: true,
  })
  rawMethod() {
    return 'file content';
  }

  @Get('empty-response')
  @ApiDoc({
    summary: 'No response schema endpoint',
  })
  emptyMethod() {
    return null;
  }
}

describe('ApiDoc Decorator', () => {
  it('should decorate controller methods without throwing exceptions', () => {
    const controller = new TestDocController();
    expect(controller).toBeDefined();
    expect(typeof controller.standardMethod).toBe('function');
    expect(typeof controller.createMethod).toBe('function');
    expect(typeof controller.paginatedMethod).toBe('function');
    expect(typeof controller.arrayMethod).toBe('function');
    expect(typeof controller.rawMethod).toBe('function');
    expect(typeof controller.emptyMethod).toBe('function');
  });
});
