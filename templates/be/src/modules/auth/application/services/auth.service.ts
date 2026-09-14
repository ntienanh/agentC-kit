import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthSessionResponseDto } from '../dto/auth-session-response.dto';
import { UsersService } from '../../../users/users.service';
import { UserResponseDto } from '../../../users/application/dto/user-response.dto';
import { HashUtil, TokenUtil } from '@shared/utils';
import { EntityStatus, UserRole } from '@shared/enums';
import { DOMAIN_CONSTANTS } from '@repo/contracts';
import { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret || jwtSecret.trim() === '') {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is missing or empty. A secure JWT secret must be configured.',
      );
    }
    this.jwtSecret = jwtSecret;

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret || refreshSecret.trim() === '') {
      throw new Error(
        'FATAL: JWT_REFRESH_SECRET environment variable is missing or empty. A secure JWT refresh secret must be configured.',
      );
    }
    this.refreshSecret = refreshSecret;
  }

  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = TokenUtil.sign(
      { sub: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      DOMAIN_CONSTANTS.AUTH.ACCESS_TOKEN_EXPIRY_SECONDS,
    );

    const refreshToken = TokenUtil.sign(
      { sub: user.id, email: user.email, role: user.role },
      this.refreshSecret,
      DOMAIN_CONSTANTS.AUTH.REFRESH_TOKEN_EXPIRY_SECONDS,
    );

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto): Promise<AuthSessionResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await HashUtil.verifyPassword(
      dto.password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (
      user.status === EntityStatus.INACTIVE ||
      user.status === EntityStatus.DELETED
    ) {
      throw new UnauthorizedException('Account is inactive or disabled');
    }

    const tokens = this.generateTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: UserResponseDto.fromDomain(user),
    };
  }

  async register(dto: RegisterDto): Promise<AuthSessionResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Email "${dto.email}" is already registered`);
    }

    const userDto = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      displayName: dto.displayName,
      role: UserRole.USER,
      status: EntityStatus.ACTIVE,
    });

    const user = (await this.usersService.findById(userDto.id))!;
    const tokens = this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userDto,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthSessionResponseDto> {
    const payload = TokenUtil.verify(dto.refreshToken, this.refreshSecret);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (
      user.status === EntityStatus.INACTIVE ||
      user.status === EntityStatus.DELETED
    ) {
      throw new UnauthorizedException('Account is inactive or disabled');
    }

    const tokens = this.generateTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: UserResponseDto.fromDomain(user),
    };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    return this.usersService.findOne(userId);
  }
}
