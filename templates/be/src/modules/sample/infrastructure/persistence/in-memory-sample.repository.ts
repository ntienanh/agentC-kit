import { Injectable } from '@nestjs/common';
import { ISampleRepository } from '../../domain/repositories/sample.repository.interface';
import { Sample } from '../../domain/entities/sample.entity';
import { SampleMapper } from '../mappers/sample.mapper';
import { SampleRecord } from './sample.record';
import { Nullable, PaginationResult } from '@shared/types';
import { PaginationQueryDto } from '@shared/dto';
import { EntityStatus, SortOrder } from '@shared/enums';

@Injectable()
export class InMemorySampleRepository implements ISampleRepository {
  private readonly records: Map<string, SampleRecord> = new Map();
  private readonly mapper = new SampleMapper();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const sample1 = new Sample({
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Starter Enterprise License',
      description: 'Standard enterprise starter subscription tier',
      price: 299000,
      status: EntityStatus.ACTIVE,
    });

    const sample2 = new Sample({
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Professional Agent Hub',
      description: 'Dedicated multi-agent orchestrator package',
      price: 599000,
      status: EntityStatus.ACTIVE,
    });

    const rec1 = this.mapper.toPersistence(sample1);
    const rec2 = this.mapper.toPersistence(sample2);
    this.records.set(rec1.id, rec1);
    this.records.set(rec2.id, rec2);
  }

  findById(id: string): Promise<Nullable<Sample>> {
    const record = this.records.get(id);
    return Promise.resolve(record ? this.mapper.toDomain(record) : null);
  }

  findAll(query: PaginationQueryDto): Promise<PaginationResult<Sample>> {
    const all = Array.from(this.records.values()).sort((a, b) =>
      query.sortOrder === SortOrder.ASC
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const totalItems = all.length;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const skip = (page - 1) * limit;

    const items = all
      .slice(skip, skip + limit)
      .map((r) => this.mapper.toDomain(r));

    return Promise.resolve({
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  }

  create(entity: Sample): Promise<Sample> {
    const record = this.mapper.toPersistence(entity);
    this.records.set(record.id, record);
    return Promise.resolve(this.mapper.toDomain(record));
  }

  update(entity: Sample): Promise<Sample> {
    if (!this.records.has(entity.id)) {
      return Promise.reject(new Error(`Sample ${entity.id} not found`));
    }
    const record = this.mapper.toPersistence(entity);
    this.records.set(record.id, record);
    return Promise.resolve(this.mapper.toDomain(record));
  }

  delete(id: string): Promise<void> {
    this.records.delete(id);
    return Promise.resolve();
  }

  clear(): void {
    this.records.clear();
  }

  count(): number {
    return this.records.size;
  }
}
