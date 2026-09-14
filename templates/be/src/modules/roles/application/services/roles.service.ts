import { Injectable } from '@nestjs/common';
import { RoleDto } from '../../presentation/controllers/roles.controller';
import { UserRole } from '@shared/enums';

@Injectable()
export class RolesService {
  private readonly roles: RoleDto[] = [
    {
      id: 'super-admin',
      name: UserRole.SUPER_ADMIN,
      description: 'Super Administrator with full permissions',
      permissions: ['*:*'],
    },
    {
      id: 'admin',
      name: UserRole.ADMIN,
      description: 'Administrator with management access',
      permissions: ['sample:*', 'users:*', 'roles:read', 'permissions:read'],
    },
    {
      id: 'staff',
      name: UserRole.STAFF,
      description: 'Staff member with operational access',
      permissions: ['sample:read', 'sample:write'],
    },
    {
      id: 'user',
      name: UserRole.USER,
      description: 'Standard end user',
      permissions: ['sample:read'],
    },
  ];

  findAll(): RoleDto[] {
    return this.roles;
  }

  findByName(name: string): RoleDto | undefined {
    return this.roles.find((r) => r.name === name);
  }
}
