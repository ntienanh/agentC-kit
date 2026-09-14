import { Module } from '@nestjs/common';
import { PermissionsController } from './presentation/controllers/permissions.controller';
import { PermissionsService } from './application/services/permissions.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
