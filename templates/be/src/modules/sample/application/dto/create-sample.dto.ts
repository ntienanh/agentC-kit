import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSampleDto {
  @ApiProperty({
    description: 'Display name of the sample item',
    example: 'Canonical Sample Item',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the sample',
    example: 'Sample item created for testing and demonstration',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Price in smallest currency unit',
    example: 99000,
  })
  @IsNumber()
  @Min(0)
  price!: number;
}
