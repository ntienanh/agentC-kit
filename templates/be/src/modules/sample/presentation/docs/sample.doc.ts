import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SampleResponseDto } from '../../application/dto/sample-response.dto';

export class SampleDocs {
  static create() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a new sample item' }),
      ApiResponse({
        status: 201,
        description: 'Sample created successfully',
        type: SampleResponseDto,
      }),
      ApiResponse({ status: 400, description: 'Validation failed' }),
    );
  }

  static findAll() {
    return applyDecorators(
      ApiOperation({ summary: 'List all sample items (paginated)' }),
      ApiResponse({
        status: 200,
        description: 'Paginated list of samples',
        type: [SampleResponseDto],
      }),
    );
  }

  static findOne() {
    return applyDecorators(
      ApiOperation({ summary: 'Get sample item by ID' }),
      ApiResponse({
        status: 200,
        description: 'Sample found',
        type: SampleResponseDto,
      }),
      ApiResponse({ status: 404, description: 'Sample not found' }),
    );
  }

  static update() {
    return applyDecorators(
      ApiOperation({ summary: 'Update sample item by ID' }),
      ApiResponse({
        status: 200,
        description: 'Sample updated successfully',
        type: SampleResponseDto,
      }),
      ApiResponse({ status: 404, description: 'Sample not found' }),
    );
  }

  static delete() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete sample item by ID' }),
      ApiResponse({ status: 200, description: 'Sample deleted successfully' }),
      ApiResponse({ status: 404, description: 'Sample not found' }),
    );
  }
}
