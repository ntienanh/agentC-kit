import { BaseEntity, BaseEntityProps } from '../../../core/database/base.entity';
import { IPrescriptionItemDto } from '@repo/contracts';
import { BadRequestException } from '@nestjs/common';

export interface PrescriptionProps extends BaseEntityProps {
  consultationId: string;
  items: IPrescriptionItemDto[];
  isLocked?: boolean;
}

export class PrescriptionEntity extends BaseEntity {
  private _consultationId: string;
  private _items: IPrescriptionItemDto[];
  private _isLocked: boolean;

  constructor(props: PrescriptionProps) {
    super(props);
    this._consultationId = props.consultationId;
    this._items = props.items;
    this._isLocked = props.isLocked ?? false;
  }

  get consultationId(): string {
    return this._consultationId;
  }

  get items(): IPrescriptionItemDto[] {
    return this._items;
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  lock(): void {
    this._isLocked = true;
    this.markAsUpdated();
  }

  updateItems(items: IPrescriptionItemDto[]): void {
    if (this._isLocked) {
      throw new BadRequestException('Prescription is locked and cannot be modified.');
    }
    this._items = items;
    this.markAsUpdated();
  }
}
