import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterDto } from '../../application/dto/register.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { AuthSessionResponseDto } from '../../application/dto/auth-session-response.dto';
import { UserResponseDto } from '../../../users/application/dto/user-response.dto';
import { Public, RateLimit } from '@shared/decorators';
import { AuthenticatedUser } from '../../../../core/guards/jwt-auth.guard';
import { RateLimitGuard } from '../../../../core/guards/rate-limit.guard';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 5 })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests (Rate Limit Exceeded)',
  })
  login(@Body() dto: LoginDto): Promise<AuthSessionResponseDto> {
    return this.authService.login(dto);
  }

  @Post('register')
  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 5 })
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, type: AuthSessionResponseDto })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests (Rate Limit Exceeded)',
  })
  register(@Body() dto: RegisterDto): Promise<AuthSessionResponseDto> {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthSessionResponseDto> {
    return this.authService.refresh(dto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  getProfile(
    @Req() req: { user?: AuthenticatedUser },
  ): Promise<UserResponseDto> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Unauthenticated');
    }
    return this.authService.getProfile(req.user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile (alias for /profile)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  getMe(@Req() req: { user?: AuthenticatedUser }): Promise<UserResponseDto> {
    return this.getProfile(req);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and clear session' })
  @ApiResponse({ status: 200, description: 'Logout success' })
  logout(): { success: boolean; message: string } {
    return { success: true, message: 'Logged out successfully' };
  }
}
