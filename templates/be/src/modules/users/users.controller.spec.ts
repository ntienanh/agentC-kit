import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './presentation/controllers/users.controller';
import { CreateUserService } from './application/services/create-user.service';
import { GetUserByIdService } from './application/services/get-user-by-id.service';
import { ListUsersService } from './application/services/list-users.service';
import { UpdateUserService } from './application/services/update-user.service';
import { DeleteUserService } from './application/services/delete-user.service';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';
import { UserRole, EntityStatus } from '@shared/enums';

import { PaginationQueryDto } from '@shared/dto';

describe('UsersController Integration', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        CreateUserService,
        GetUserByIdService,
        ListUsersService,
        UpdateUserService,
        DeleteUserService,
        {
          provide: USER_REPOSITORY,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should list users with pagination metadata', async () => {
    const query = new PaginationQueryDto();
    query.page = 1;
    query.limit = 10;
    const result = await controller.findAll(query);
    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(result.meta.totalItems).toBeGreaterThanOrEqual(2);
  });

  it('should find user by ID', async () => {
    const user = await controller.findOne(
      '110e8400-e29b-41d4-a716-446655440001',
    );
    expect(user.id).toBe('110e8400-e29b-41d4-a716-446655440001');
    expect(user.email).toBe('admin@example.com');
  });

  it('should create a new user', async () => {
    const created = await controller.create({
      email: 'new.staff@example.com',
      password: 'SecurePassword@123',
      displayName: 'Staff Member',
      role: UserRole.STAFF,
      status: EntityStatus.ACTIVE,
    });

    expect(created.id).toBeDefined();
    expect(created.email).toBe('new.staff@example.com');
    expect(created.role).toBe(UserRole.STAFF);
  });

  it('should update user profile', async () => {
    const updated = await controller.update(
      '110e8400-e29b-41d4-a716-446655440002',
      {
        displayName: 'Updated Standard User',
        phone: '1234567890',
      },
    );

    expect(updated.displayName).toBe('Updated Standard User');
    expect(updated.phone).toBe('1234567890');
  });

  it('should patch user status', async () => {
    const patched = await controller.patch(
      '110e8400-e29b-41d4-a716-446655440002',
      {
        status: EntityStatus.INACTIVE,
      },
    );

    expect(patched.status).toBe(EntityStatus.INACTIVE);
  });

  it('should delete user by ID', async () => {
    const result = await controller.delete(
      '110e8400-e29b-41d4-a716-446655440002',
    );
    expect(result.success).toBe(true);
  });
});
