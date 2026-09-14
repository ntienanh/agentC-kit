import { Test, TestingModule } from '@nestjs/testing';
import { SampleService } from './sample.service';
import { CreateSampleService } from './application/services/create-sample.service';
import { GetSampleByIdService } from './application/services/get-sample-by-id.service';
import { ListSamplesService } from './application/services/list-samples.service';
import { UpdateSampleService } from './application/services/update-sample.service';
import { DeleteSampleService } from './application/services/delete-sample.service';
import { SAMPLE_REPOSITORY } from './domain/repositories/sample.repository.interface';
import { InMemorySampleRepository } from './infrastructure/persistence/in-memory-sample.repository';
import { PaginationQueryDto } from '@shared/dto';
import { EntityStatus } from '@shared/enums';

describe('SampleService (Canonical Clean Architecture Spec)', () => {
  let service: SampleService;
  let repository: InMemorySampleRepository;

  beforeEach(async () => {
    repository = new InMemorySampleRepository();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SampleService,
        CreateSampleService,
        GetSampleByIdService,
        ListSamplesService,
        UpdateSampleService,
        DeleteSampleService,
        {
          provide: SAMPLE_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<SampleService>(SampleService);
  });

  it('lists seeded sample items', async () => {
    const result = await service.findAll(new PaginationQueryDto());
    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(result.meta.totalItems).toBeGreaterThanOrEqual(2);
  });

  it('creates and retrieves a new sample item', async () => {
    const created = await service.create({
      name: 'Test Item',
      description: 'Test description',
      price: 150000,
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Item');
    expect(created.price).toBe(150000);
    expect(created.status).toBe(EntityStatus.ACTIVE);

    const retrieved = await service.findOne(created.id);
    expect(retrieved.id).toBe(created.id);
    expect(retrieved.name).toBe('Test Item');
  });

  it('updates an existing sample item', async () => {
    const created = await service.create({
      name: 'Before Update',
      price: 100000,
    });

    const updated = await service.update(created.id, {
      name: 'After Update',
      price: 200000,
    });

    expect(updated.name).toBe('After Update');
    expect(updated.price).toBe(200000);
  });

  it('deletes a sample item', async () => {
    const created = await service.create({
      name: 'To Delete',
      price: 50000,
    });

    await service.delete(created.id);
    await expect(service.findOne(created.id)).rejects.toThrow();
  });
});
