import { Test, TestingModule } from '@nestjs/testing';
import { SampleController } from './presentation/controllers/sample.controller';
import { SampleModule } from './sample.module';
import { DatabaseModule } from '../../core/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { PaginationQueryDto } from '@shared/dto';

describe('SampleController Integration', () => {
  let controller: SampleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        SampleModule,
      ],
    }).compile();

    controller = module.get<SampleController>(SampleController);
  });

  it('should execute full CRUD cycle on SampleController', async () => {
    const created = await controller.create({
      name: 'Integration Sample Item',
      description: 'Tested via SampleController',
      price: 150.0,
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Integration Sample Item');
    expect(created.price).toBe(150.0);

    const found = await controller.findOne(created.id);
    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Integration Sample Item');

    const query = new PaginationQueryDto();
    const list = await controller.findAll(query);
    expect(list.items.length).toBeGreaterThanOrEqual(1);

    const updated = await controller.update(created.id, {
      name: 'Integration Sample Item (Renamed)',
      price: 175.5,
    });
    expect(updated.name).toBe('Integration Sample Item (Renamed)');
    expect(updated.price).toBe(175.5);

    const deleteResult = await controller.delete(created.id);
    expect(deleteResult.success).toBe(true);

    await expect(controller.findOne(created.id)).rejects.toThrow();
  });
});
