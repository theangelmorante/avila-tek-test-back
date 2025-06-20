import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RegisterUserCommand } from '../commands/register-user.command';
import { CreateUserCommand } from '../../../users/application/commands/create-user.command';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { AUTH_SERVICE } from '../../domain/tokens';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  private readonly logger = new Logger(RegisterUserHandler.name);

  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    private readonly commandBus: any, // CommandBus para ejecutar comandos del módulo Users
  ) {}

  async execute(
    command: RegisterUserCommand,
  ): Promise<{ id: string; email: string }> {
    this.logger.log(
      `Ejecutando comando RegisterUserCommand para email: ${command.email}`,
    );

    try {
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

      this.logger.log(`Usuario registrado exitosamente: ${result.id}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Error al registrar usuario: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
