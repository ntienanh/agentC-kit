import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { HashUtil } from '@shared/utils';

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.updateProfile({
      displayName: dto.displayName,
      avatar: dto.avatar,
      phone: dto.phone,
    });

    if (dto.role) {
      user.updateRole(dto.role);
    }

    if (dto.status) {
      user.updateStatus(dto.status);
    }

    if (dto.password) {
      user.updatePassword(await HashUtil.hashPassword(dto.password));
    }

    const updated = await this.userRepository.update(user);
    return UserResponseDto.fromDomain(updated);
  }
}
