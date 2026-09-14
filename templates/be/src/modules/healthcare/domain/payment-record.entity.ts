import { BaseEntity, BaseEntityProps } from '../../../core/database/base.entity';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentRecordDto,
} from '@repo/contracts';
import { BadRequestException } from '@nestjs/common';

export interface PaymentRecordProps extends BaseEntityProps {
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  transactionRef?: string | null;
}

export class PaymentRecordEntity extends BaseEntity {
  private _appointmentId: string;
  private _amount: number;
  private _method: PaymentMethod;
  private _status: PaymentStatus;
  private _transactionRef: string | null;

  constructor(props: PaymentRecordProps) {
    super(props);
    this._appointmentId = props.appointmentId;
    this._amount = props.amount;
    this._method = props.method;
    this._status = props.status ?? PaymentStatus.UNPAID;
    this._transactionRef = props.transactionRef ?? null;
  }

  get appointmentId(): string {
    return this._appointmentId;
  }

  get amount(): number {
    return this._amount;
  }

  get method(): PaymentMethod {
    return this._method;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get transactionRef(): string | null {
    return this._transactionRef;
  }

  markPaid(transactionRef?: string | null): void {
    this._status = PaymentStatus.PAID;
    if (transactionRef) {
      this._transactionRef = transactionRef;
    }
    this.markAsUpdated();
  }

  refund(): void {
    if (this._status !== PaymentStatus.PAID) {
      throw new BadRequestException('Cannot refund an unpaid transaction.');
    }
    this._status = PaymentStatus.REFUNDED;
    this.markAsUpdated();
  }

  toDto(): PaymentRecordDto {
    return {
      id: this.id,
      appointmentId: this._appointmentId,
      amount: this._amount,
      method: this._method,
      status: this._status,
      transactionRef: this._transactionRef,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
