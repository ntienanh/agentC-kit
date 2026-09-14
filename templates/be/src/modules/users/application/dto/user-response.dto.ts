import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus, UserRole } from '@shared/enums';
import { IUserDto } from '@repo/contracts';
import { User } from '../../domain/entities/user.entity';

export class UserResponseDto implements IUserDto {
  @ApiProperty({
    description: 'Unique identifier (UUID v4)',
    example: '110e8400-e29b-41d4-a716-446655440001',
  })
  id!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'admin@example.com',
  })
  email!: string;

  @ApiPropertyOptional({
    description: 'Display name',
    example: 'Super Admin',
    nullable: true,
  })
  displayName!: string | null;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    nullable: true,
  })
  avatar!: string | null;

  @ApiPropertyOptional({
    description: 'Phone number',
    nullable: true,
  })
  phone!: string | null;

  @ApiProperty({
    description: 'Assigned RBAC role',
    enum: UserRole,
    example: UserRole.SUPER_ADMIN,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Account status',
    enum: EntityStatus,
    example: EntityStatus.ACTIVE,
  })
  status!: EntityStatus;

  @ApiProperty({
    description: 'Whether email has been verified',
    example: true,
  })
  emailVerified!: boolean;

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

  static fromDomain(entity: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.displayName = entity.displayName;
    dto.avatar = entity.avatar;
    dto.phone = entity.phone;
    dto.role = entity.role;
    dto.status = entity.status;
    dto.emailVerified = entity.emailVerified;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
