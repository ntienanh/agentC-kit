import { Injectable } from '@nestjs/common';
import { PermissionDto } from '../../presentation/controllers/permissions.controller';

@Injectable()
export class PermissionsService {
  private readonly permissions: PermissionDto[] = [
    {
      id: 'perm-sample-read',
      subject: 'sample',
      action: 'read',
      description: 'View sample items',
    },
    {
      id: 'perm-sample-create',
      subject: 'sample',
      action: 'create',
      description: 'Create new sample items',
    },
    {
      id: 'perm-sample-update',
      subject: 'sample',
      action: 'update',
      description: 'Modify existing sample items',
    },
    {
      id: 'perm-sample-delete',
      subject: 'sample',
      action: 'delete',
      description: 'Remove sample items',
    },
    {
      id: 'perm-users-manage',
      subject: 'users',
      action: 'manage',
      description: 'Manage users and roles',
    },
    {
      id: 'perm-roles-read',
      subject: 'roles',
      action: 'read',
      description: 'View role assignments',
    },
  ];

  findAll(): PermissionDto[] {
    return this.permissions;
  }
}
