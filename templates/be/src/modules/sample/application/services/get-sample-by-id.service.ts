import { Inject, Injectable } from '@nestjs/common';
import { SampleResponseDto } from '../dto/sample-response.dto';
import {
  ISampleRepository,
  SAMPLE_REPOSITORY,
} from '../../domain/repositories/sample.repository.interface';
import { SampleNotFoundException } from '../../domain/exceptions/sample-not-found.exception';

@Injectable()
export class GetSampleByIdService {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: ISampleRepository,
  ) {}

  async execute(id: string): Promise<SampleResponseDto> {
    const entity = await this.sampleRepository.findById(id);
    if (!entity) {
      throw new SampleNotFoundException(id);
    }
    return SampleResponseDto.fromDomain(entity);
  }
}
