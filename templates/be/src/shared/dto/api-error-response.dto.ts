import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorCode } from '@shared/enums';
import { ApiErrorResponse, ValidationErrorDetail } from '@shared/types';

export class ValidationErrorDetailDto implements ValidationErrorDetail {
  @ApiProperty({
    example: 'email',
    description: 'Tên trường bị lỗi (hỗ trợ nested: user.address.city)',
  })
  field: string;

  @ApiProperty({
    example: 'ISEMAIL',
    description: 'Mã vi phạm ràng buộc (constraint code)',
  })
  code: string;

  @ApiProperty({
    example: 'Email format is invalid.',
    description: 'Thông điệp lỗi chi tiết',
  })
  message: string;
}

export class ApiErrorResponseDto<
  TParams = Record<string, unknown>,
> implements ApiErrorResponse<TParams> {
  @ApiProperty({
    example: false,
    description: 'Trạng thái thành công của request (luôn là false khi có lỗi)',
  })
  success: false;

  @ApiProperty({ example: 400, description: 'Mã trạng thái HTTP' })
  statusCode: number;

  @ApiProperty({
    enum: ErrorCode,
    example: ErrorCode.VALIDATION_FAILED,
    description: 'Mã lỗi định danh phục vụ đa ngôn ngữ (i18n)',
  })
  errorCode: ErrorCode;

  @ApiProperty({
    example: 'Validation failed.',
    description: 'Thông báo fallback tiếng Anh cho Developer',
  })
  message: string;

  @ApiPropertyOptional({
    example: { email: 'test@example.com' },
    description: 'Các tham số động phục vụ ghép chuỗi dịch i18n',
  })
  params?: TParams;

  @ApiPropertyOptional({
    type: [ValidationErrorDetailDto],
    description: 'Danh sách chi tiết các trường bị lỗi validation',
  })
  errors?: ValidationErrorDetailDto[];

  @ApiProperty({
    example: '2026-08-18T17:00:00.000Z',
    description: 'Thời điểm xảy ra lỗi (UTC)',
  })
  timestamp: string;

  @ApiProperty({
    example: '/api/v1/users',
    description: 'Đường dẫn API gây ra lỗi',
  })
  path: string;
}
