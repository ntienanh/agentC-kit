import { User } from '../entities/user.entity';
import { Nullable, PaginationResult } from '@shared/types';
import { PaginationQueryDto } from '@shared/dto';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findById(id: string): Promise<Nullable<User>>;
  findByEmail(email: string): Promise<Nullable<User>>;
  findAll(query: PaginationQueryDto): Promise<PaginationResult<User>>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  count(): number;
}
