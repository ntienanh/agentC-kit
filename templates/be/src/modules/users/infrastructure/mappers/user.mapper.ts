import { User } from '../../domain/entities/user.entity';
import { UserRecord } from '../persistence/user.record';

export class UserMapper {
  toDomain(record: UserRecord): User {
    return new User({
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      displayName: record.displayName,
      avatar: record.avatar,
      phone: record.phone,
      role: record.role,
      status: record.status,
      emailVerified: record.emailVerified,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
    });
  }

  toPersistence(domain: User): UserRecord {
    return {
      id: domain.id,
      email: domain.email,
      passwordHash: domain.passwordHash,
      displayName: domain.displayName,
      avatar: domain.avatar,
      phone: domain.phone,
      role: domain.role,
      status: domain.status,
      emailVerified: domain.emailVerified,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      version: domain.version,
    };
  }
}
