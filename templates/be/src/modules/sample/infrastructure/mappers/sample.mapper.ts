import { Sample } from '../../domain/entities/sample.entity';
import { SampleRecord } from '../persistence/sample.record';

export class SampleMapper {
  toDomain(record: SampleRecord): Sample {
    return new Sample({
      id: record.id,
      name: record.name,
      description: record.description,
      price: record.price,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
    });
  }

  toPersistence(domain: Sample): SampleRecord {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      price: domain.price,
      status: domain.status,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      version: domain.version,
    };
  }
}
