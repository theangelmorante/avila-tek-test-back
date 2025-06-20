import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from '../commands/create-user.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/tokens';
import { User } from '../../domain/entities/user.entity';

// Mock del repositorio de usuarios
const mockUserRepository = {
  findByEmail: jest.fn(),
  save: jest.fn(),
};

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let userRepository: IUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateUserHandler>(CreateUserHandler);
    userRepository = module.get<IUserRepository>(USER_REPOSITORY);
  });

  // Limpiar los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create and save a new user successfully', async () => {
      // Arrange
      const command = new CreateUserCommand(
        'test@example.com',
        'hashedPassword',
        'John',
        'Doe',
      );

      const userEntity = User.create(
        command.email,
        command.password,
        command.firstName,
        command.lastName,
      );

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(userEntity);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
      expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
      expect(result).toEqual({
        id: userEntity.id,
        email: userEntity.email,
      });
    });

    it('should throw a ConflictException if the user already exists', async () => {
      // Arrange
      const command = new CreateUserCommand(
        'test@example.com',
        'hashedPassword',
        'John',
        'Doe',
      );
      const existingUser = User.create(
        'test@example.com',
        'anotherHashedPassword',
        'Jane',
        'Doe',
      );

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new ConflictException('El usuario ya existe con este email'),
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
