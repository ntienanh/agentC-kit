import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';

export class ApiSuccessResponseDto<TData = unknown> {
  @ApiProperty({
    description: 'Trạng thái thành công của yêu cầu',
    example: true,
  })
  success: true;

  @ApiProperty({
    description: 'Mã trạng thái HTTP',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Dữ liệu phản hồi nghiệp vụ chính (Object hoặc Array)',
  })
  data: TData;

  @ApiPropertyOptional({
    description: 'Thông tin phân trang (chỉ xuất hiện khi API có phân trang)',
    type: () => PaginationMetaDto,
  })
  meta?: PaginationMetaDto;

  @ApiPropertyOptional({
    description: 'Thông báo thành công (tùy chọn)',
    example: 'Thao tác thành công',
  })
  message?: string;

  @ApiProperty({
    description: 'Thời điểm phản hồi được tạo theo chuẩn ISO-8601 UTC',
    example: '2026-08-19T15:54:34.778Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Đường dẫn URL của API được gọi',
    example: '/api/v1/users',
  })
  path: string;
}
