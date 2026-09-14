import { randomUUID } from 'crypto';

export interface BaseEntityProps {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  version?: number;
}

export abstract class BaseEntity {
  protected _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _deletedAt: Date | null;
  protected _version: number;

  constructor(props?: BaseEntityProps) {
    this._id = props?.id || randomUUID();
    this._createdAt = props?.createdAt || new Date();
    this._updatedAt = props?.updatedAt || new Date();
    this._deletedAt = props?.deletedAt ?? null;
    this._version = props?.version !== undefined ? props.version : 1;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get version(): number {
    return this._version;
  }

  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  markAsUpdated(): void {
    this._updatedAt = new Date();
    this._version += 1;
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.markAsUpdated();
  }

  restore(): void {
    this._deletedAt = null;
    this.markAsUpdated();
  }
}
