import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@shared/enums';
import { DEFAULT_ERROR_TEMPLATES } from '@shared/constants';

export interface DomainExceptionOptions {
  errorCode: ErrorCode;
  statusCode?: HttpStatus;
  params?: Record<string, unknown>;
  message?: string;
  cause?: Error;
}

export class BaseDomainException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly params?: Record<string, unknown>;

  constructor(options: DomainExceptionOptions) {
    const statusCode = options.statusCode ?? HttpStatus.BAD_REQUEST;
    const formattedMessage =
      options.message ??
      BaseDomainException.formatMessage(options.errorCode, options.params);

    super(
      {
        errorCode: options.errorCode,
        message: formattedMessage,
        params: options.params,
      },
      statusCode,
      { cause: options.cause },
    );

    this.errorCode = options.errorCode;
    this.params = options.params;
  }

  private static formatMessage(
    errorCode: ErrorCode,
    params?: Record<string, unknown>,
  ): string {
    const template = DEFAULT_ERROR_TEMPLATES[errorCode];

    if (template) {
      if (!params || Object.keys(params).length === 0) {
        return template;
      }

      let result = template;
      for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
      }
      return result;
    }

    const humanized = errorCode
      .toLowerCase()
      .split('_')
      .map((word, idx) =>
        idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
      )
      .join(' ');

    if (!params || Object.keys(params).length === 0) {
      return `${humanized}.`;
    }

    const paramDetails = Object.entries(params)
      .map(([k, v]) => `${k}='${String(v)}'`)
      .join(', ');

    return `${humanized} (${paramDetails}).`;
  }
}
