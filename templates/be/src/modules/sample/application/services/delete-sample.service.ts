import { Inject, Injectable } from '@nestjs/common';
import {
  ISampleRepository,
  SAMPLE_REPOSITORY,
} from '../../domain/repositories/sample.repository.interface';
import { SampleNotFoundException } from '../../domain/exceptions/sample-not-found.exception';

@Injectable()
export class DeleteSampleService {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: ISampleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const entity = await this.sampleRepository.findById(id);
    if (!entity) {
      throw new SampleNotFoundException(id);
    }
    await this.sampleRepository.delete(id);
  }
}
