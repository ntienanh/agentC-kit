import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from '../../application/services/permissions.service';
import { Public } from '@shared/decorators';

import type { IPermissionDto } from '@repo/contracts';

export type PermissionDto = IPermissionDto;

@ApiTags('Permissions')
@Controller('api/v1/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all CASL RBAC permissions' })
  @ApiResponse({ status: 200, description: 'Permission matrix' })
  findAll(): PermissionDto[] {
    return this.permissionsService.findAll();
  }
}
