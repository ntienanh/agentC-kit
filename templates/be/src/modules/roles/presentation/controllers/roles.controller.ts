import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesService } from '../../application/services/roles.service';
import { Public } from '@shared/decorators';

import type { IRoleDto } from '@repo/contracts';

export type RoleDto = IRoleDto;

@ApiTags('Roles')
@Controller('api/v1/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all system roles' })
  @ApiResponse({ status: 200, description: 'Role definitions' })
  findAll(): RoleDto[] {
    return this.rolesService.findAll();
  }
}
