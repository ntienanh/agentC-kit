import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import { SortOrder } from '@shared/enums';
import {
  ApiErrorResponseDto,
  ValidationErrorDetailDto,
} from './api-error-response.dto';
import { ApiSuccessResponseDto } from './api-success-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

describe('Shared DTOs', () => {
  describe('PaginationQueryDto', () => {
    it('should initialize with default pagination values and compute skip', () => {
      const dto = new PaginationQueryDto();

      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
      expect(dto.sortOrder).toBe(SortOrder.DESC);
      expect(dto.skip).toBe(0);
    });

    it('should correctly compute skip for custom page and limit', () => {
      const raw = { page: '3', limit: '25', sortOrder: SortOrder.ASC };
      const dto = plainToInstance(PaginationQueryDto, raw);

      expect(dto.page).toBe(3);
      expect(dto.limit).toBe(25);
      expect(dto.sortOrder).toBe(SortOrder.ASC);
      expect(dto.skip).toBe(50);
    });

    it('should fail validation when page or limit are outside acceptable bounds', async () => {
      const invalidDto = plainToInstance(PaginationQueryDto, {
        page: 0,
        limit: 200,
      });

      const errors = await validate(invalidDto);
      expect(errors.some((e) => e.property === 'page')).toBe(true);
      expect(errors.some((e) => e.property === 'limit')).toBe(true);
    });
  });

  describe('ApiSuccessResponseDto, ApiErrorResponseDto, PaginationMetaDto', () => {
    it('should instantiate DTOs without errors', () => {
      const successDto = new ApiSuccessResponseDto();
      successDto.success = true;
      successDto.statusCode = 200;
      successDto.data = { id: 1 };
      successDto.timestamp = new Date().toISOString();
      successDto.path = '/api';

      expect(successDto.success).toBe(true);

      interface SwaggerMetaProperty {
        type?: () => unknown;
      }
      const metaPropertyMetadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        ApiSuccessResponseDto.prototype,
        'meta',
      ) as SwaggerMetaProperty | undefined;
      if (
        metaPropertyMetadata &&
        typeof metaPropertyMetadata.type === 'function'
      ) {
        expect(metaPropertyMetadata.type()).toBe(PaginationMetaDto);
      }

      const errDetail = new ValidationErrorDetailDto();
      errDetail.field = 'email';
      errDetail.code = 'ISEMAIL';
      errDetail.message = 'Invalid email';
      expect(errDetail.field).toBe('email');

      const metaDto = new PaginationMetaDto();
      metaDto.page = 1;
      metaDto.limit = 10;
      metaDto.totalItems = 100;
      metaDto.totalPages = 10;
      metaDto.hasNextPage = true;
      metaDto.hasPreviousPage = false;
      expect(metaDto.totalPages).toBe(10);

      const errDto = new ApiErrorResponseDto();
      errDto.success = false;
      errDto.statusCode = 400;
      expect(errDto.statusCode).toBe(400);
    });
  });
});
