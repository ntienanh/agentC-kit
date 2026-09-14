import { NotFoundException } from '@nestjs/common';

export class SampleNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Sample with ID "${id}" was not found.`);
  }
}
