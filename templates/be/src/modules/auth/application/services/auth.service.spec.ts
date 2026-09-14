import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../../../users/users.service';
import { CreateUserService } from '../../../users/application/services/create-user.service';
import { GetUserByIdService } from '../../../users/application/services/get-user-by-id.service';
import { ListUsersService } from '../../../users/application/services/list-users.service';
import { UpdateUserService } from '../../../users/application/services/update-user.service';
import { DeleteUserService } from '../../../users/application/services/delete-user.service';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import { InMemoryUserRepository } from '../../../users/infrastructure/persistence/in-memory-user.repository';
import { UserRole } from '@shared/enums';

describe('AuthService (Authentication & Session Spec)', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const userRepository = new InMemoryUserRepository();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        CreateUserService,
        GetUserByIdService,
        ListUsersService,
        UpdateUserService,
        DeleteUserService,
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'JWT_SECRET') return 'test-jwt-secret';
              if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
              return null;
            },
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('successfully logs in seeded admin account', async () => {
    const session = await authService.login({
      email: 'admin@example.com',
      password: 'Admin@123456',
    });

    expect(session.accessToken).toBeDefined();
    expect(session.refreshToken).toBeDefined();
    expect(session.user.email).toBe('admin@example.com');
    expect(session.user.role).toBe(UserRole.SUPER_ADMIN);
  });

  it('rejects login with wrong password', async () => {
    await expect(
      authService.login({
        email: 'admin@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('registers a new user and returns session', async () => {
    const session = await authService.register({
      email: 'registered@example.com',
      password: 'StrongPass123!',
      displayName: 'Newly Registered',
    });

    expect(session.accessToken).toBeDefined();
    expect(session.user.email).toBe('registered@example.com');
    expect(session.user.role).toBe(UserRole.USER);
  });

  it('refreshes token session', async () => {
    const session = await authService.login({
      email: 'user@example.com',
      password: 'User@123456',
    });

    const refreshed = await authService.refresh({
      refreshToken: session.refreshToken,
    });

    expect(refreshed.accessToken).toBeDefined();
    expect(refreshed.user.email).toBe('user@example.com');
  });

  it('throws fatal error on initialization if JWT_SECRET is missing', () => {
    const emptyConfig = {
      get: (key: string) => {
        if (key === 'JWT_SECRET') return undefined;
        return 'test-refresh-secret';
      },
    } as unknown as ConfigService;

    expect(
      () => new AuthService({} as unknown as UsersService, emptyConfig),
    ).toThrow(/JWT_SECRET/);
  });

  it('throws fatal error on initialization if JWT_REFRESH_SECRET is missing', () => {
    const emptyConfig = {
      get: (key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        return undefined;
      },
    } as unknown as ConfigService;

    expect(
      () => new AuthService({} as unknown as UsersService, emptyConfig),
    ).toThrow(/JWT_REFRESH_SECRET/);
  });
});
