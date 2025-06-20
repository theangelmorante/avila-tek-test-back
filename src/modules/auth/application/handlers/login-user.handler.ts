import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { LoginUserCommand } from '../commands/login-user.command';
import { GetUserByEmailQuery } from '../../../users/application/queries/get-user-by-email.query';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { AUTH_SERVICE } from '../../domain/tokens';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  private readonly logger = new Logger(LoginUserHandler.name);

  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    private readonly queryBus: any, // QueryBus para ejecutar consultas del módulo Users
  ) {}

  async execute(
    command: LoginUserCommand,
  ): Promise<{ token: string; user: any }> {
    this.logger.log(
      `Ejecutando comando LoginUserCommand para email: ${command.email}`,
    );

    try {
      const { email, password } = command;

      // Buscar el usuario por email usando el módulo de Users
      const getUserQuery = new GetUserByEmailQuery(email);
      const user = await this.queryBus.execute(getUserQuery);

      if (!user) {
        this.logger.warn(`Intento de login con email no registrado: ${email}`);
        throw new Error('Credenciales inválidas');
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        throw new Error('Usuario inactivo');
      }

      // Verificar la contraseña
      const isPasswordValid = await this.authService.comparePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(
          `Intento de login con contraseña incorrecta para: ${email}`,
        );
        throw new Error('Credenciales inválidas');
      }

      // Generar el token JWT
      const token = await this.authService.generateToken(user);

      this.logger.log(`Login exitoso para usuario: ${user.id}`);

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
      this.logger.error(`Error al hacer login: ${error.message}`, error.stack);
      throw error;
    }
  }
}
