import { ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { CreateUserCommand } from '../commands/create-user.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../domain/tokens';

export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<{ id: string; email: string }> {
    const { email, password, firstName, lastName } = command;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El usuario ya existe con este email');
    }

    // Crear el usuario (la contraseña ya debe venir hasheada desde el módulo de auth)
    const user = User.create(email, password, firstName, lastName);

    // Guardar el usuario
    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
    };
  }
}
