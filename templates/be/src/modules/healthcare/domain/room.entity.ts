import { BaseEntity, BaseEntityProps } from '../../../core/database/base.entity';
import { RoomDto } from '@repo/contracts';

export interface RoomProps extends BaseEntityProps {
  roomNumber: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export class RoomEntity extends BaseEntity {
  private _roomNumber: string;
  private _name: string;
  private _description: string | null;
  private _isActive: boolean;

  constructor(props: RoomProps) {
    super(props);
    this._roomNumber = props.roomNumber;
    this._name = props.name;
    this._description = props.description ?? null;
    this._isActive = props.isActive ?? true;
  }

  get roomNumber(): string {
    return this._roomNumber;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  updateDetails(params: {
    roomNumber?: string;
    name?: string;
    description?: string | null;
    isActive?: boolean;
  }): void {
    if (params.roomNumber !== undefined) this._roomNumber = params.roomNumber;
    if (params.name !== undefined) this._name = params.name;
    if (params.description !== undefined) this._description = params.description;
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

  toDto(): RoomDto {
    return {
      id: this.id,
      roomNumber: this._roomNumber,
      name: this._name,
      description: this._description,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
