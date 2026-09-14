import { Module } from '@nestjs/common';
import { UsersController } from './presentation/controllers/users.controller';
import { CreateUserService } from './application/services/create-user.service';
import { GetUserByIdService } from './application/services/get-user-by-id.service';
import { ListUsersService } from './application/services/list-users.service';
import { UpdateUserService } from './application/services/update-user.service';
import { DeleteUserService } from './application/services/delete-user.service';
import { UsersService } from './users.service';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserService,
    GetUserByIdService,
    ListUsersService,
    UpdateUserService,
    DeleteUserService,
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [UsersService, USER_REPOSITORY],
})
export class UsersModule {}
