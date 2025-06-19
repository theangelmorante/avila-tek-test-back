import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterUserCommand } from '../commands/register-user.command';
import { CreateUserCommand } from '../../../users/application/commands/create-user.command';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { AUTH_SERVICE } from '../../domain/tokens';

export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    private readonly commandBus: any, // CommandBus para ejecutar comandos del módulo Users
  ) {}

  async execute(
    command: RegisterUserCommand,
  ): Promise<{ id: string; email: string }> {
    const { email, password, firstName, lastName } = command;

    // Hashear la contraseña
    const hashedPassword = await this.authService.hashPassword(password);

    // Crear el usuario usando el módulo de Users
    const createUserCommand = new CreateUserCommand(
      email,
      hashedPassword,
      firstName,
      lastName,
    );

    const result = await this.commandBus.execute(createUserCommand);

    return result;
  }
}
