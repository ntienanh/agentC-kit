import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '@shared/enums';
import { Sample } from '../../domain/entities/sample.entity';

export class SampleResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Canonical Sample Item',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Description of the item',
    example: 'Sample description text',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Price in smallest currency unit',
    example: 99000,
  })
  price!: number;

  @ApiProperty({
    description: 'Lifecycle status',
    enum: EntityStatus,
    example: EntityStatus.ACTIVE,
  })
  status!: EntityStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;

  static fromDomain(entity: Sample): SampleResponseDto {
    const dto = new SampleResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.price = entity.price;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
