import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSampleDto } from '../../application/dto/create-sample.dto';
import { UpdateSampleDto } from '../../application/dto/update-sample.dto';
import { SampleResponseDto } from '../../application/dto/sample-response.dto';
import { CreateSampleService } from '../../application/services/create-sample.service';
import { GetSampleByIdService } from '../../application/services/get-sample-by-id.service';
import { ListSamplesService } from '../../application/services/list-samples.service';
import { UpdateSampleService } from '../../application/services/update-sample.service';
import { DeleteSampleService } from '../../application/services/delete-sample.service';
import { SampleDocs } from '../docs/sample.doc';
import { PaginationQueryDto } from '@shared/dto';
import { PaginationResult } from '@shared/types';
import { Public } from '@shared/decorators';

@ApiTags('Samples')
@Controller('api/v1/samples')
export class SampleController {
  constructor(
    private readonly createSampleService: CreateSampleService,
    private readonly getSampleByIdService: GetSampleByIdService,
    private readonly listSamplesService: ListSamplesService,
    private readonly updateSampleService: UpdateSampleService,
    private readonly deleteSampleService: DeleteSampleService,
  ) {}

  @Post()
  @Public()
  @SampleDocs.create()
  create(@Body() dto: CreateSampleDto): Promise<SampleResponseDto> {
    return this.createSampleService.execute(dto);
  }

  @Get()
  @Public()
  @SampleDocs.findAll()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginationResult<SampleResponseDto>> {
    return this.listSamplesService.execute(query);
  }

  @Get(':id')
  @Public()
  @SampleDocs.findOne()
  findOne(@Param('id') id: string): Promise<SampleResponseDto> {
    return this.getSampleByIdService.execute(id);
  }

  @Put(':id')
  @Public()
  @SampleDocs.update()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSampleDto,
  ): Promise<SampleResponseDto> {
    return this.updateSampleService.execute(id, dto);
  }

  @Patch(':id')
  @Public()
  @SampleDocs.update()
  patch(
    @Param('id') id: string,
    @Body() dto: UpdateSampleDto,
  ): Promise<SampleResponseDto> {
    return this.updateSampleService.execute(id, dto);
  }

  @Delete(':id')
  @Public()
  @SampleDocs.delete()
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.deleteSampleService.execute(id);
    return { success: true };
  }
}
