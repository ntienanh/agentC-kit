import { EntityStatus } from '@shared/enums';

export interface SampleRecord {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
