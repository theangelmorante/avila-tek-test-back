import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserCommand } from '../../../application/commands/register-user.command';
import { LoginUserCommand } from '../../../application/commands/login-user.command';
import { Public } from '../../../../../shared/domain/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    const command = new RegisterUserCommand(
      registerUserDto.email,
      registerUserDto.password,
      registerUserDto.firstName,
      registerUserDto.lastName,
    );

    const result = await this.commandBus.execute(command);

    return {
      message: 'Usuario registrado exitosamente',
      data: result,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    const command = new LoginUserCommand(
      loginUserDto.email,
      loginUserDto.password,
    );

    const result = await this.commandBus.execute(command);

    return {
      message: 'Login exitoso',
      data: result,
    };
  }
}
