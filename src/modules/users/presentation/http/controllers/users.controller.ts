import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GetUserByIdQuery } from '../../../application/queries/get-user-by-id.query';
import { GetUserByEmailQuery } from '../../../application/queries/get-user-by-email.query';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Get the information of a specific user by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'User obtained successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') id: string) {
    this.logger.log(`Getting user by ID: ${id}`);

    const query = new GetUserByIdQuery(id);
    const user = await this.queryBus.execute(query);

    this.logger.log(`User obtained: ${user.email}`);

    return {
      message: 'User obtained successfully',
      data: user,
    };
  }

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user by email',
    description: 'Get the information of a specific user by their email',
  })
  @ApiParam({
    name: 'email',
    description: 'User email',
    example: 'usuario@ejemplo.com',
  })
  @ApiResponse({
    status: 200,
    description: 'User obtained successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserByEmail(@Param('email') email: string) {
    this.logger.log(`Getting user by email: ${email}`);

    const query = new GetUserByEmailQuery(email);
    const user = await this.queryBus.execute(query);
    return {
      message: 'User obtained successfully',
      data: user,
    };
  }
}
