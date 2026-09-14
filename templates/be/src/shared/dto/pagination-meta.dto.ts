import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '@shared/types';

export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({
    description: 'Trang hiện tại (1-indexed)',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Số lượng phần tử trên mỗi trang',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Tổng số lượng bản ghi thỏa mãn điều kiện',
    example: 100,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Cờ báo hiệu có trang tiếp theo hay không',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Cờ báo hiệu có trang trước đó hay không',
    example: false,
  })
  hasPreviousPage: boolean;
}
