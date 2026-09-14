import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserRecord } from './user.record';
import { Nullable, PaginationResult } from '@shared/types';
import { PaginationQueryDto } from '@shared/dto';
import { EntityStatus, SortOrder, UserRole } from '@shared/enums';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly records: Map<string, UserRecord> = new Map();
  private readonly mapper = new UserMapper();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const adminUser = new User({
      id: '110e8400-e29b-41d4-a716-446655440001',
      email: 'admin@example.com',
      passwordHash:
        '45215a588d0196a607b444a81d09fe72:a3a67db6a3c523e48946648615e562fa5d9953cf18c5479d24dd66933e2fe0aa0e3e55401f1dde78d8c94f2ba86892dfd967cb3f2fce365129aa74e5fc7432cc',
      displayName: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      status: EntityStatus.ACTIVE,
      emailVerified: true,
    });

    const standardUser = new User({
      id: '110e8400-e29b-41d4-a716-446655440002',
      email: 'user@example.com',
      passwordHash:
        '8ad626da27ca1a749e3889898b431ffe:92d733f2f160a658e1497598c75148e532d781ac4d447e51fb1bc610327720e86874f9f3abcb66dae24abe137ce3e41190025025547a3e0bc17d96cc1e531aa8',
      displayName: 'Standard User',
      role: UserRole.USER,
      status: EntityStatus.ACTIVE,
      emailVerified: true,
    });

    const recAdmin = this.mapper.toPersistence(adminUser);
    const recUser = this.mapper.toPersistence(standardUser);
    this.records.set(recAdmin.id, recAdmin);
    this.records.set(recUser.id, recUser);
  }

  findById(id: string): Promise<Nullable<User>> {
    const record = this.records.get(id);
    return Promise.resolve(record ? this.mapper.toDomain(record) : null);
  }

  findByEmail(email: string): Promise<Nullable<User>> {
    const normalized = email.toLowerCase().trim();
    for (const record of this.records.values()) {
      if (record.email === normalized) {
        return Promise.resolve(this.mapper.toDomain(record));
      }
    }
    return Promise.resolve(null);
  }

  findAll(query: PaginationQueryDto): Promise<PaginationResult<User>> {
    const all = Array.from(this.records.values()).sort((a, b) =>
      query.sortOrder === SortOrder.ASC
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const totalItems = all.length;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const skip = (page - 1) * limit;

    const items = all
      .slice(skip, skip + limit)
      .map((r) => this.mapper.toDomain(r));

    return Promise.resolve({
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  }

  create(user: User): Promise<User> {
    const record = this.mapper.toPersistence(user);
    this.records.set(record.id, record);
    return Promise.resolve(this.mapper.toDomain(record));
  }

  update(user: User): Promise<User> {
    if (!this.records.has(user.id)) {
      return Promise.reject(new Error(`User ${user.id} not found`));
    }
    const record = this.mapper.toPersistence(user);
    this.records.set(record.id, record);
    return Promise.resolve(this.mapper.toDomain(record));
  }

  delete(id: string): Promise<void> {
    this.records.delete(id);
    return Promise.resolve();
  }

  count(): number {
    return this.records.size;
  }
}
