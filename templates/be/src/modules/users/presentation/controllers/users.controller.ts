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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { CreateUserService } from '../../application/services/create-user.service';
import { GetUserByIdService } from '../../application/services/get-user-by-id.service';
import { ListUsersService } from '../../application/services/list-users.service';
import { UpdateUserService } from '../../application/services/update-user.service';
import { DeleteUserService } from '../../application/services/delete-user.service';
import { PaginationQueryDto } from '@shared/dto';
import { PaginationResult } from '@shared/types';
import { Roles } from '@shared/decorators';
import { UserRole } from '@shared/enums';

@ApiTags('Users')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Controller('api/v1/users')
export class UsersController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserByIdService: GetUserByIdService,
    private readonly listUsersService: ListUsersService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: DeleteUserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserService.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List users with pagination' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginationResult<UserResponseDto>> {
    return this.listUsersService.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.getUserByIdService.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.updateUserService.execute(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Patch user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  patch(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.updateUserService.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.deleteUserService.execute(id);
    return { success: true };
  }
}
