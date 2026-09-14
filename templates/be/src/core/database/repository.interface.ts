import { PaginationQueryDto } from '@shared/dto';
import { PaginationResult, Nullable } from '@shared/types';

export interface IBaseRepository<TDomain> {
  findById(id: string): Promise<Nullable<TDomain>>;
  findAll(query: PaginationQueryDto): Promise<PaginationResult<TDomain>>;
  save(entity: TDomain): Promise<TDomain>;
  delete(id: string): Promise<void>;
}
