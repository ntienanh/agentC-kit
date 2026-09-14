export const UNIT_OF_WORK_TOKEN = Symbol('IUnitOfWork');

export interface IUnitOfWork {
  execute<T>(work: () => Promise<T>): Promise<T>;
}
