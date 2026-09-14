import { Injectable } from '@nestjs/common';
import { IUnitOfWork } from './unit-of-work.interface';

@Injectable()
export class InMemoryUnitOfWork implements IUnitOfWork {
  private executionCount = 0;
  private lastError: Error | null = null;

  async execute<T>(work: () => Promise<T>): Promise<T> {
    this.executionCount++;
    try {
      const result = await work();
      this.lastError = null;
      return result;
    } catch (error) {
      this.lastError = error as Error;
      throw error;
    }
  }

  getExecutionCount(): number {
    return this.executionCount;
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  reset(): void {
    this.executionCount = 0;
    this.lastError = null;
  }
}
