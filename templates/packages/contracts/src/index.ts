import 'reflect-metadata';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER',
}

export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  OPTIMISTIC_LOCK_CONFLICT = 'OPTIMISTIC_LOCK_CONFLICT',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_INACTIVE = 'USER_INACTIVE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
}

export const DOMAIN_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  AUTH: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 64,
    BCRYPT_SALT_ROUNDS: 10,
    ACCESS_TOKEN_EXPIRY_SECONDS: 3600,
    REFRESH_TOKEN_EXPIRY_SECONDS: 7 * 86400,
  },
} as const;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    timestamp?: string;
    [key: string]: unknown;
  };
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: PaginationMeta;
    timestamp?: string;
  };
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  error: {
    status: number;
    message: string;
    code?: string;
    details?: ApiErrorDetail[] | unknown;
    timestamp?: string;
  };
}

export interface BaseEntityDto {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IUserDto {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  phone: string | null;
  role: UserRole;
  status: EntityStatus;
  emailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ILoginRequestDto {
  email: string;
  password: string;
}

export interface IRegisterRequestDto {
  email: string;
  password: string;
  displayName?: string;
}

export interface IRefreshTokenRequestDto {
  refreshToken: string;
}

export interface IAuthSession {
  accessToken: string;
  refreshToken: string;
  user: IUserDto;
}

export interface IRoleDto {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface IPermissionDto {
  id: string;
  subject: string;
  action: string;
  description?: string | null;
}

export interface ISampleDto {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  status: EntityStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICreateSampleDto {
  name: string;
  description?: string | null;
  price: number;
}

export interface IUpdateSampleDto {
  name?: string;
  description?: string | null;
  price?: number;
  status?: EntityStatus;
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class LoginRequestDto implements ILoginRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RegisterRequestDto implements IRegisterRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional()
  displayName?: string;
}

export class RefreshTokenRequestDto implements IRefreshTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class CreateSampleDto implements ICreateSampleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class UpdateSampleDto implements IUpdateSampleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;
}

export * from './healthcare.contract';
