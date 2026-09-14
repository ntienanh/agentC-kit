import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { UsersModule } from '../../../users/users.module';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserRole } from '@shared/enums';

describe('AuthController Integration', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
              JWT_REFRESH_SECRET:
                'test-jwt-refresh-secret-at-least-32-characters-long',
            }),
          ],
        }),
        UsersModule,
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should authenticate pre-seeded admin user', async () => {
    const result = await controller.login({
      email: 'admin@example.com',
      password: 'Admin@123456',
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe('admin@example.com');
    expect(result.user.role).toBe(UserRole.SUPER_ADMIN);
  });

  it('should authenticate pre-seeded standard user', async () => {
    const result = await controller.login({
      email: 'user@example.com',
      password: 'User@123456',
    });

    expect(result.user.email).toBe('user@example.com');
    expect(result.user.role).toBe(UserRole.USER);
  });

  it('should reject invalid password', async () => {
    await expect(
      controller.login({
        email: 'admin@example.com',
        password: 'WrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should register a new user successfully', async () => {
    const result = await controller.register({
      email: 'controller.test@example.com',
      password: 'SecretPassword@123',
      displayName: 'Integration User',
    });

    expect(result.user.email).toBe('controller.test@example.com');
    expect(result.user.role).toBe(UserRole.USER);
    expect(result.accessToken).toBeDefined();
  });

  it('should reject duplicate registration', async () => {
    await expect(
      controller.register({
        email: 'admin@example.com',
        password: 'Password@123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should refresh access token using valid refresh token', async () => {
    const session = await controller.login({
      email: 'user@example.com',
      password: 'User@123456',
    });

    const refreshed = await controller.refresh({
      refreshToken: session.refreshToken,
    });

    expect(refreshed.accessToken).toBeDefined();
    expect(refreshed.user.email).toBe('user@example.com');
  });

  it('should return profile for authenticated user id', async () => {
    const session = await controller.login({
      email: 'admin@example.com',
      password: 'Admin@123456',
    });

    const profile = await controller.getProfile({
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
    });

    expect(profile.id).toBe(session.user.id);
    expect(profile.email).toBe('admin@example.com');
  });

  it('should reject getProfile without user id in request', () => {
    expect(() => controller.getProfile({})).toThrow(UnauthorizedException);
  });

  it('should handle logout gracefully', () => {
    const result = controller.logout();
    expect(result.success).toBe(true);
  });
});
