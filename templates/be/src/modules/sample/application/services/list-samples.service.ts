import { Inject, Injectable } from '@nestjs/common';
import { SampleResponseDto } from '../dto/sample-response.dto';
import {
  ISampleRepository,
  SAMPLE_REPOSITORY,
} from '../../domain/repositories/sample.repository.interface';
import { PaginationQueryDto } from '@shared/dto';
import { PaginationResult } from '@shared/types';

@Injectable()
export class ListSamplesService {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: ISampleRepository,
  ) {}

  async execute(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<SampleResponseDto>> {
    const result = await this.sampleRepository.findAll(query);
    return {
      items: result.items.map((e) => SampleResponseDto.fromDomain(e)),
      meta: result.meta,
    };
  }
}
