import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserService } from './application/services/create-user.service';
import { GetUserByIdService } from './application/services/get-user-by-id.service';
import { ListUsersService } from './application/services/list-users.service';
import { UpdateUserService } from './application/services/update-user.service';
import { DeleteUserService } from './application/services/delete-user.service';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';
import { UserRole } from '@shared/enums';

describe('UsersService (Deterministic Seed and CRUD Spec)', () => {
  let service: UsersService;
  let repository: InMemoryUserRepository;

  beforeEach(async () => {
    repository = new InMemoryUserRepository();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        CreateUserService,
        GetUserByIdService,
        ListUsersService,
        UpdateUserService,
        DeleteUserService,
        {
          provide: USER_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('has seeded admin and user accounts', async () => {
    const admin = await service.findByEmail('admin@example.com');
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe(UserRole.SUPER_ADMIN);

    const user = await service.findByEmail('user@example.com');
    expect(user).not.toBeNull();
    expect(user?.role).toBe(UserRole.USER);
  });

  it('creates and finds a new user', async () => {
    const created = await service.create({
      email: 'newbie@example.com',
      password: 'StrongPassword123!',
      displayName: 'Newbie',
    });

    expect(created.email).toBe('newbie@example.com');
    expect(created.displayName).toBe('Newbie');

    const found = await service.findOne(created.id);
    expect(found.id).toBe(created.id);
  });

  it('updates a user role and display name', async () => {
    const user = await service.findByEmail('user@example.com');
    expect(user).not.toBeNull();

    const updated = await service.update(user!.id, {
      displayName: 'Upgraded User',
      role: UserRole.STAFF,
    });

    expect(updated.displayName).toBe('Upgraded User');
    expect(updated.role).toBe(UserRole.STAFF);
  });
});
