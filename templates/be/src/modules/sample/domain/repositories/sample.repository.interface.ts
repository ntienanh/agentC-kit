import { Sample } from '../entities/sample.entity';
import { Nullable, PaginationResult } from '@shared/types';
import { PaginationQueryDto } from '@shared/dto';

export const SAMPLE_REPOSITORY = Symbol('SAMPLE_REPOSITORY');

export interface ISampleRepository {
  findById(id: string): Promise<Nullable<Sample>>;
  findAll(query: PaginationQueryDto): Promise<PaginationResult<Sample>>;
  create(entity: Sample): Promise<Sample>;
  update(entity: Sample): Promise<Sample>;
  delete(id: string): Promise<void>;
  count(): number;
}
