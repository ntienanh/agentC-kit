import { Module } from '@nestjs/common';
import { SampleController } from './presentation/controllers/sample.controller';
import { CreateSampleService } from './application/services/create-sample.service';
import { GetSampleByIdService } from './application/services/get-sample-by-id.service';
import { ListSamplesService } from './application/services/list-samples.service';
import { UpdateSampleService } from './application/services/update-sample.service';
import { DeleteSampleService } from './application/services/delete-sample.service';
import { SampleService } from './sample.service';
import { SAMPLE_REPOSITORY } from './domain/repositories/sample.repository.interface';
import { InMemorySampleRepository } from './infrastructure/persistence/in-memory-sample.repository';

@Module({
  controllers: [SampleController],
  providers: [
    CreateSampleService,
    GetSampleByIdService,
    ListSamplesService,
    UpdateSampleService,
    DeleteSampleService,
    SampleService,
    {
      provide: SAMPLE_REPOSITORY,
      useClass: InMemorySampleRepository,
    },
  ],
  exports: [SampleService, SAMPLE_REPOSITORY],
})
export class SampleModule {}
