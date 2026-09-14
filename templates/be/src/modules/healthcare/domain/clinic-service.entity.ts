import { BaseEntity, BaseEntityProps } from '../../../core/database/base.entity';
import { ClinicServiceDto } from '@repo/contracts';

export interface ClinicServiceProps extends BaseEntityProps {
  name: string;
  code: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
}

export class ClinicServiceEntity extends BaseEntity {
  private _name: string;
  private _code: string;
  private _description: string | null;
  private _durationMinutes: number;
  private _price: number;
  private _isActive: boolean;

  constructor(props: ClinicServiceProps) {
    super(props);
    this._name = props.name;
    this._code = props.code;
    this._description = props.description ?? null;
    this._durationMinutes = props.durationMinutes;
    this._price = props.price;
    this._isActive = props.isActive ?? true;
  }

  get name(): string {
    return this._name;
  }

  get code(): string {
    return this._code;
  }

  get description(): string | null {
    return this._description;
  }

  get durationMinutes(): number {
    return this._durationMinutes;
  }

  get price(): number {
    return this._price;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  updateDetails(params: {
    name?: string;
    code?: string;
    description?: string | null;
    durationMinutes?: number;
    price?: number;
    isActive?: boolean;
  }): void {
    if (params.name !== undefined) this._name = params.name;
    if (params.code !== undefined) this._code = params.code;
    if (params.description !== undefined) this._description = params.description;
    if (params.durationMinutes !== undefined) this._durationMinutes = params.durationMinutes;
    if (params.price !== undefined) this._price = params.price;
    if (params.isActive !== undefined) this._isActive = params.isActive;
    this.markAsUpdated();
  }

  activate(): void {
    this._isActive = true;
    this.markAsUpdated();
  }

  deactivate(): void {
    this._isActive = false;
    this.markAsUpdated();
  }

  toDto(): ClinicServiceDto {
    return {
      id: this.id,
      name: this._name,
      code: this._code,
      description: this._description,
      durationMinutes: this._durationMinutes,
      price: this._price,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
