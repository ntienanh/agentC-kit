import { Module } from '@nestjs/common';
import { InMemoryUnitOfWork } from './in-memory-unit-of-work';
import { UNIT_OF_WORK_TOKEN } from './unit-of-work.interface';

@Module({
  providers: [
    {
      provide: UNIT_OF_WORK_TOKEN,
      useClass: InMemoryUnitOfWork,
    },
  ],
  exports: [UNIT_OF_WORK_TOKEN],
})
export class DatabaseModule {}
