import { Global, Module } from '@nestjs/common';
import { StructuredLoggerService } from './structured-logger.service';
import { RequestContextService } from '../context/request-context.service';

@Global()
@Module({
  providers: [RequestContextService, StructuredLoggerService],
  exports: [RequestContextService, StructuredLoggerService],
})
export class LoggerModule {}
