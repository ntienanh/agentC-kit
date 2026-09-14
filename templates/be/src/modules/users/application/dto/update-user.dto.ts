import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { EntityStatus, UserRole } from '@shared/enums';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Updated display name',
    example: 'John Smith',
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Assigned role',
    enum: UserRole,
    example: UserRole.STAFF,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Account status',
    enum: EntityStatus,
    example: EntityStatus.INACTIVE,
  })
  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;

  @ApiPropertyOptional({
    description: 'New password if changing',
    example: 'NewSecret@123',
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
