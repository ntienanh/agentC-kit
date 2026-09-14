import { Inject, Injectable } from '@nestjs/common';
import { UpdateSampleDto } from '../dto/update-sample.dto';
import { SampleResponseDto } from '../dto/sample-response.dto';
import {
  ISampleRepository,
  SAMPLE_REPOSITORY,
} from '../../domain/repositories/sample.repository.interface';
import { SampleNotFoundException } from '../../domain/exceptions/sample-not-found.exception';

@Injectable()
export class UpdateSampleService {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: ISampleRepository,
  ) {}

  async execute(id: string, dto: UpdateSampleDto): Promise<SampleResponseDto> {
    const entity = await this.sampleRepository.findById(id);
    if (!entity) {
      throw new SampleNotFoundException(id);
    }

    entity.updateDetails({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      status: dto.status,
    });

    const updated = await this.sampleRepository.update(entity);
    return SampleResponseDto.fromDomain(updated);
  }
}
