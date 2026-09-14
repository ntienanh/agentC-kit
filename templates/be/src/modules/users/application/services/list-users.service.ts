import { Inject, Injectable } from '@nestjs/common';
import { UserResponseDto } from '../dto/user-response.dto';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { PaginationQueryDto } from '@shared/dto';
import { PaginationResult } from '@shared/types';

@Injectable()
export class ListUsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<UserResponseDto>> {
    const result = await this.userRepository.findAll(query);
    return {
      items: result.items.map((u) => UserResponseDto.fromDomain(u)),
      meta: result.meta,
    };
  }
}
