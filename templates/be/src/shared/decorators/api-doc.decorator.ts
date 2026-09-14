import { applyDecorators, HttpCode, HttpStatus, Type } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
  ApiErrorResponseDto,
  ApiSuccessResponseDto,
  PaginationMetaDto,
} from '@shared/dto';
import { ErrorCode } from '@shared/enums';

export interface ApiDocErrorOption {
  status: HttpStatus | number;
  description?: string;
  errorCode?: ErrorCode | string;
}

export interface ApiDocOptions {
  summary: string;

  description?: string;

  response?: Type<unknown>;

  status?: HttpStatus;

  isPaginated?: boolean;

  isArray?: boolean;

  errors?: (HttpStatus | number | ApiDocErrorOption)[];

  auth?: boolean;

  rawResponse?: boolean;
}

export function ApiDoc(options: ApiDocOptions): MethodDecorator {
  const decorators: (MethodDecorator | ClassDecorator)[] = [];
  const status = options.status ?? HttpStatus.OK;

  decorators.push(HttpCode(status));

  decorators.push(
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
  );

  if (options.auth !== false) {
    decorators.push(ApiBearerAuth('bearer-auth'));
  }

  const extraModels: Type<unknown>[] = [
    ApiSuccessResponseDto,
    ApiErrorResponseDto,
    PaginationMetaDto,
  ];
  if (options.response) {
    extraModels.push(options.response);
  }
  decorators.push(ApiExtraModels(...extraModels));

  if (options.rawResponse && options.response) {
    decorators.push(
      ApiResponse({
        status,
        type: options.response,
        isArray: options.isArray,
      }),
    );
  } else if (options.response) {
    let dataSchema: SchemaObject | ReferenceObject;

    if (options.isPaginated || options.isArray) {
      dataSchema = {
        type: 'array',
        items: { $ref: getSchemaPath(options.response) },
      };
    } else {
      dataSchema = {
        $ref: getSchemaPath(options.response),
      };
    }

    const successProperties: Record<string, SchemaObject | ReferenceObject> = {
      success: { type: 'boolean', example: true },
      statusCode: { type: 'number', example: status },
      data: dataSchema,
      timestamp: {
        type: 'string',
        example: new Date().toISOString(),
      },
      path: { type: 'string', example: '/api/v1/resource' },
    };

    if (options.isPaginated) {
      successProperties.meta = { $ref: getSchemaPath(PaginationMetaDto) };
    }

    decorators.push(
      ApiResponse({
        status,
        description: options.summary,
        schema: {
          properties: successProperties,
          required: ['success', 'statusCode', 'data', 'timestamp', 'path'],
        },
      }),
    );
  } else {
    decorators.push(
      ApiResponse({
        status,
        description: options.summary,
      }),
    );
  }

  if (options.errors && options.errors.length > 0) {
    for (const error of options.errors) {
      let errStatus: HttpStatus;
      let errDesc: string;
      let errCode: string | undefined;

      if (typeof error === 'number') {
        errStatus = error;
        errDesc = getDefaultErrorDescription(errStatus);
      } else {
        errStatus = error.status;
        errDesc = error.description ?? getDefaultErrorDescription(errStatus);
        errCode = error.errorCode;
      }

      decorators.push(
        ApiResponse({
          status: errStatus,
          description: errDesc,
          schema: {
            properties: {
              success: { type: 'boolean', example: false },
              statusCode: { type: 'number', example: errStatus },
              errorCode: {
                type: 'string',
                example: errCode ?? getDefaultErrorCode(errStatus),
              },
              message: { type: 'string', example: errDesc },
              timestamp: {
                type: 'string',
                example: new Date().toISOString(),
              },
              path: { type: 'string', example: '/api/v1/resource' },
            },
            required: [
              'success',
              'statusCode',
              'errorCode',
              'message',
              'timestamp',
              'path',
            ],
          },
        }),
      );
    }
  }

  return applyDecorators(...decorators);
}

function getDefaultErrorDescription(status: HttpStatus): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'Dữ liệu đầu vào không hợp lệ (Validation Failed)';
    case HttpStatus.UNAUTHORIZED:
      return 'Chưa xác thực hoặc Access Token không hợp lệ';
    case HttpStatus.FORBIDDEN:
      return 'Không có quyền truy cập tài nguyên này';
    case HttpStatus.NOT_FOUND:
      return 'Không tìm thấy tài nguyên yêu cầu';
    case HttpStatus.CONFLICT:
      return 'Xung đột dữ liệu hoặc bản ghi đã tồn tại';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'Lỗi hệ thống nội bộ máy chủ';
    default:
      return 'Phản hồi lỗi';
  }
}

function getDefaultErrorCode(status: HttpStatus): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCode.VALIDATION_FAILED;
    case HttpStatus.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ErrorCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.USER_NOT_FOUND;
    case HttpStatus.CONFLICT:
      return ErrorCode.USER_ALREADY_EXISTS;
    default:
      return ErrorCode.INTERNAL_SERVER_ERROR;
  }
}
