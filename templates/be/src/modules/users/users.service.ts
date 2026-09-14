import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './application/dto/create-user.dto';
import { UpdateUserDto } from './application/dto/update-user.dto';
import { UserResponseDto } from './application/dto/user-response.dto';
import { CreateUserService } from './application/services/create-user.service';
import { GetUserByIdService } from './application/services/get-user-by-id.service';
import { ListUsersService } from './application/services/list-users.service';
import { UpdateUserService } from './application/services/update-user.service';
import { DeleteUserService } from './application/services/delete-user.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from './domain/repositories/user.repository.interface';
import { User } from './domain/entities/user.entity';
import { Nullable, PaginationResult } from '@shared/types';
import { PaginationQueryDto } from '@shared/dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserByIdService: GetUserByIdService,
    private readonly listUsersService: ListUsersService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: DeleteUserService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  create(dto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserService.execute(dto);
  }

  findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<UserResponseDto>> {
    return this.listUsersService.execute(query);
  }

  findOne(id: string): Promise<UserResponseDto> {
    return this.getUserByIdService.execute(id);
  }

  findByEmail(email: string): Promise<Nullable<User>> {
    return this.userRepository.findByEmail(email);
  }

  findById(id: string): Promise<Nullable<User>> {
    return this.userRepository.findById(id);
  }

  update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    return this.updateUserService.execute(id, dto);
  }

  delete(id: string): Promise<void> {
    return this.deleteUserService.execute(id);
  }

  count(): number {
    return this.userRepository.count();
  }
}
