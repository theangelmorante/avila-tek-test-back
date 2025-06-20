import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
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
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: RegisterUserCommand,
  ): Promise<{ id: string; email: string }> {
    this.logger.log(
      `Executing RegisterUserCommand for email: ${command.email}`,
    );

    try {
      const { email, password, firstName, lastName } = command;

      // Hash the password
      const hashedPassword = await this.authService.hashPassword(password);

      // Create the user using the Users module
      const createUserCommand = new CreateUserCommand(
        email,
        hashedPassword,
        firstName,
        lastName,
      );

      const result = await this.commandBus.execute(createUserCommand);

      this.logger.log(`User registered successfully: ${result.id}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Error registering user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
