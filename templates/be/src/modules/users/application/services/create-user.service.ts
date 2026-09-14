import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../../domain/entities/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { HashUtil } from '@shared/utils';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Email "${dto.email}" is already registered`);
    }

    const passwordHash = await HashUtil.hashPassword(dto.password);
    const user = new User({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
      avatar: dto.avatar,
      phone: dto.phone,
      role: dto.role,
      status: dto.status,
      emailVerified: false,
    });

    const saved = await this.userRepository.create(user);
    return UserResponseDto.fromDomain(saved);
  }
}
