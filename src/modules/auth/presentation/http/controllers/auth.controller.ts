import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../../../../../shared/domain/decorators/public.decorator';
import { RegisterUserCommand } from '../../../application/commands/register-user.command';
import { LoginUserCommand } from '../../../application/commands/login-user.command';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account in the system',
  })
  @ApiBody({
    type: RegisterUserDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        code: { type: 'number', example: 201 },
        message: { type: 'string', example: 'User registered successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1234567890' },
            email: { type: 'string', example: 'user@example.com' },
          },
        },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        path: { type: 'string', example: '/auth/register' },
        method: { type: 'string', example: 'POST' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
  async register(@Body() registerUserDto: RegisterUserDto) {
    this.logger.log(`Starting user registration: ${registerUserDto.email}`);

    const command = new RegisterUserCommand(
      registerUserDto.email,
      registerUserDto.password,
      registerUserDto.firstName,
      registerUserDto.lastName,
    );

    const result = await this.commandBus.execute(command);

    this.logger.log(`User registered successfully: ${result.id}`);

    return {
      message: 'User registered successfully',
      data: result,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns a JWT token',
  })
  @ApiBody({
    type: LoginUserDto,
    description: 'Authentication credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Login successful' },
        data: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'clx1234567890' },
                email: { type: 'string', example: 'user@example.com' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                fullName: { type: 'string', example: 'John Doe' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        path: { type: 'string', example: '/auth/login' },
        method: { type: 'string', example: 'POST' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginUserDto: LoginUserDto) {
    this.logger.log(`Starting user login: ${loginUserDto.email}`);

    const command = new LoginUserCommand(
      loginUserDto.email,
      loginUserDto.password,
    );

    const result = await this.commandBus.execute(command);

    this.logger.log(`Login successful for user: ${result.user.id}`);

    return {
      message: 'Login successful',
      data: result,
    };
  }
}
