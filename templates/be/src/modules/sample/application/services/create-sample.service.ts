import { Inject, Injectable } from '@nestjs/common';
import { CreateSampleDto } from '../dto/create-sample.dto';
import { SampleResponseDto } from '../dto/sample-response.dto';
import { Sample } from '../../domain/entities/sample.entity';
import {
  ISampleRepository,
  SAMPLE_REPOSITORY,
} from '../../domain/repositories/sample.repository.interface';

@Injectable()
export class CreateSampleService {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: ISampleRepository,
  ) {}

  async execute(dto: CreateSampleDto): Promise<SampleResponseDto> {
    const entity = new Sample({
      name: dto.name,
      description: dto.description,
      price: dto.price,
    });

    const saved = await this.sampleRepository.create(entity);
    return SampleResponseDto.fromDomain(saved);
  }
}
