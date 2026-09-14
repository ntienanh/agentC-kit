import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EntityStatus } from '@shared/enums';

export class UpdateSampleDto {
  @ApiPropertyOptional({
    description: 'Updated name of the sample item',
    example: 'Updated Sample Name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the sample',
    example: 'Updated sample description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated price',
    example: 120000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Status of sample',
    enum: EntityStatus,
    example: EntityStatus.ACTIVE,
  })
  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;
}
