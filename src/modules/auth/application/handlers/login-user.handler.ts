import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Inject } from '@nestjs/common';
import { LoginUserCommand } from '../commands/login-user.command';
import { GetUserByEmailQuery } from '../../../users/application/queries/get-user-by-email.query';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { AUTH_SERVICE } from '../../domain/tokens';

export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    private readonly queryBus: any, // QueryBus para ejecutar consultas del módulo Users
  ) {}

  async execute(
    command: LoginUserCommand,
  ): Promise<{ token: string; user: any }> {
    const { email, password } = command;

    // Buscar el usuario por email usando el módulo de Users
    const getUserQuery = new GetUserByEmailQuery(email);
    const user = await this.queryBus.execute(getUserQuery);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar la contraseña
    const isPasswordValid = await this.authService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar el token JWT
    const token = await this.authService.generateToken({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

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
  }
}
