import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { LoginUserCommand } from '../commands/login-user.command';
import { GetUserByEmailQuery } from '../../../users/application/queries/get-user-by-email.query';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { AUTH_SERVICE } from '../../domain/tokens';
import { UnauthorizedException } from '@nestjs/common';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  private readonly logger = new Logger(LoginUserHandler.name);

  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    command: LoginUserCommand,
  ): Promise<{ token: string; user: any }> {
    this.logger.log(`Executing LoginUserCommand for email: ${command.email}`);

    try {
      const { email, password } = command;

      // Search the user by email using the Users module
      const getUserQuery = new GetUserByEmailQuery(email);
      const user = await this.queryBus.execute(getUserQuery);

      if (!user) {
        this.logger.warn(`Login attempt with unregistered email: ${email}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Check if the user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      // Check the password
      const isPasswordValid = await this.authService.comparePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(`Login attempt with incorrect password for: ${email}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Generate the JWT token
      const token = await this.authService.generateToken(user);

      this.logger.log(`Login successful for user: ${user.id}`);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
        },
      };
    } catch (error) {
      this.logger.error(`Error making login: ${error.message}`, error.stack);
      throw error;
    }
  }
}
