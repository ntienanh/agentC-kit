import { Injectable } from '@nestjs/common';
import { CreateSampleDto } from './application/dto/create-sample.dto';
import { UpdateSampleDto } from './application/dto/update-sample.dto';
import { SampleResponseDto } from './application/dto/sample-response.dto';
import { CreateSampleService } from './application/services/create-sample.service';
import { GetSampleByIdService } from './application/services/get-sample-by-id.service';
import { ListSamplesService } from './application/services/list-samples.service';
import { UpdateSampleService } from './application/services/update-sample.service';
import { DeleteSampleService } from './application/services/delete-sample.service';
import { PaginationQueryDto } from '@shared/dto';
import { PaginationResult } from '@shared/types';

@Injectable()
export class SampleService {
  constructor(
    private readonly createSampleService: CreateSampleService,
    private readonly getSampleByIdService: GetSampleByIdService,
    private readonly listSamplesService: ListSamplesService,
    private readonly updateSampleService: UpdateSampleService,
    private readonly deleteSampleService: DeleteSampleService,
  ) {}

  create(dto: CreateSampleDto): Promise<SampleResponseDto> {
    return this.createSampleService.execute(dto);
  }

  findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<SampleResponseDto>> {
    return this.listSamplesService.execute(query);
  }

  findOne(id: string): Promise<SampleResponseDto> {
    return this.getSampleByIdService.execute(id);
  }

  update(id: string, dto: UpdateSampleDto): Promise<SampleResponseDto> {
    return this.updateSampleService.execute(id, dto);
  }

  delete(id: string): Promise<void> {
    return this.deleteSampleService.execute(id);
  }
}
