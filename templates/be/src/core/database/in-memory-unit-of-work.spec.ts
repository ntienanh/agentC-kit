import { InMemoryUnitOfWork } from './in-memory-unit-of-work';

describe('InMemoryUnitOfWork', () => {
  let uow: InMemoryUnitOfWork;

  beforeEach(() => {
    uow = new InMemoryUnitOfWork();
  });

  it('should be defined', () => {
    expect(uow).toBeDefined();
  });

  it('should execute work and return the result', async () => {
    const result = await uow.execute(async () => 42);
    expect(result).toBe(42);
  });

  it('should increment executionCount on each call', async () => {
    await uow.execute(async () => 'a');
    await uow.execute(async () => 'b');
    expect(uow.getExecutionCount()).toBe(2);
  });

  it('should propagate errors thrown inside work', async () => {
    const boom = new Error('transaction failed');
    await expect(
      uow.execute(async () => {
        throw boom;
      }),
    ).rejects.toThrow('transaction failed');
    expect(uow.getLastError()).toBe(boom);
  });

  it('should reset state correctly', async () => {
    await uow.execute(async () => 'x');
    uow.reset();
    expect(uow.getExecutionCount()).toBe(0);
    expect(uow.getLastError()).toBeNull();
  });
});
