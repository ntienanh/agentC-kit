import {
  BaseEntity,
  BaseEntityProps,
} from '../../../../core/database/base.entity';
import { EntityStatus } from '@shared/enums';

export interface SampleProps extends BaseEntityProps {
  name: string;
  description?: string | null;
  price: number;
  status?: EntityStatus;
}

export class Sample extends BaseEntity {
  private _name: string;
  private _description: string | null;
  private _price: number;
  private _status: EntityStatus;

  constructor(props: SampleProps) {
    super(props);
    this._name = props.name;
    this._description = props.description ?? null;
    this._price = props.price;
    this._status = props.status ?? EntityStatus.ACTIVE;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get status(): EntityStatus {
    return this._status;
  }

  updateDetails(params: {
    name?: string;
    description?: string | null;
    price?: number;
    status?: EntityStatus;
  }): void {
    if (params.name !== undefined) {
      if (!params.name || params.name.trim().length === 0) {
        throw new Error('Sample name cannot be empty.');
      }
      this._name = params.name.trim();
    }

    if (params.description !== undefined) {
      this._description = params.description;
    }

    if (params.price !== undefined) {
      if (params.price < 0) {
        throw new Error('Sample price cannot be negative.');
      }
      this._price = params.price;
    }

    if (params.status !== undefined) {
      this._status = params.status;
    }

    this.markAsUpdated();
  }

  deactivate(): void {
    this._status = EntityStatus.INACTIVE;
    this.markAsUpdated();
  }

  activate(): void {
    this._status = EntityStatus.ACTIVE;
    this.markAsUpdated();
  }
}
