import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '@modules/users/application/dto/user-response.dto';

export class AuthSessionResponseDto {
  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT Refresh Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Authenticated user profile',
    type: UserResponseDto,
  })
  user!: UserResponseDto;
}
