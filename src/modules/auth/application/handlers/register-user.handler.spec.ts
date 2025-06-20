import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserHandler } from './register-user.handler';
import { RegisterUserCommand } from '../commands/register-user.command';
import { CreateUserCommand } from '../../../users/application/commands/create-user.command';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { AUTH_SERVICE } from '../../domain/tokens';
import { CommandBus } from '@nestjs/cqrs';

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let authService: IAuthService;
  let commandBus: CommandBus;

  const mockAuthService = {
    hashPassword: jest.fn(),
  };
  const mockCommandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserHandler,
        { provide: AUTH_SERVICE, useValue: mockAuthService },
        { provide: CommandBus, useValue: mockCommandBus },
      ],
    }).compile();

    handler = module.get<RegisterUserHandler>(RegisterUserHandler);
    authService = module.get<IAuthService>(AUTH_SERVICE);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should register a user successfully', async () => {
    const command = new RegisterUserCommand(
      'test@example.com',
      'password123',
      'John',
      'Doe',
    );
    mockAuthService.hashPassword.mockResolvedValue('hashedPassword');
    const userResult = { id: 'user-1', email: 'test@example.com' };
    mockCommandBus.execute.mockResolvedValue(userResult);

    const result = await handler.execute(command);

    expect(authService.hashPassword).toHaveBeenCalledWith('password123');
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateUserCommand),
    );
    expect(result).toEqual(userResult);
  });

  it('should propagate errors from the command bus', async () => {
    const command = new RegisterUserCommand(
      'test@example.com',
      'password123',
      'John',
      'Doe',
    );
    mockAuthService.hashPassword.mockResolvedValue('hashedPassword');
    mockCommandBus.execute.mockRejectedValue(new Error('User creation failed'));

    await expect(handler.execute(command)).rejects.toThrow(
      'User creation failed',
    );
    expect(authService.hashPassword).toHaveBeenCalledWith('password123');
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateUserCommand),
    );
  });
});
