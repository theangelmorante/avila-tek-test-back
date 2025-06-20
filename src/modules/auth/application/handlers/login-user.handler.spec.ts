import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserHandler } from './login-user.handler';
import { LoginUserCommand } from '../commands/login-user.command';
import { GetUserByEmailQuery } from '../../../users/application/queries/get-user-by-email.query';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { AUTH_SERVICE } from '../../domain/tokens';
import { QueryBus } from '@nestjs/cqrs';

describe('LoginUserHandler', () => {
  let handler: LoginUserHandler;
  let authService: IAuthService;
  let queryBus: QueryBus;

  const mockAuthService = {
    comparePassword: jest.fn(),
    generateToken: jest.fn(),
  };
  const mockQueryBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserHandler,
        { provide: AUTH_SERVICE, useValue: mockAuthService },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    handler = module.get<LoginUserHandler>(LoginUserHandler);
    authService = module.get<IAuthService>(AUTH_SERVICE);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should login successfully', async () => {
    const command = new LoginUserCommand('test@example.com', 'password123');
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashedPassword',
      isActive: true,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
    };
    mockQueryBus.execute.mockResolvedValue(user);
    mockAuthService.comparePassword.mockResolvedValue(true);
    mockAuthService.generateToken.mockResolvedValue('jwt-token');

    const result = await handler.execute(command);

    expect(queryBus.execute).toHaveBeenCalledWith(
      expect.any(GetUserByEmailQuery),
    );
    expect(authService.comparePassword).toHaveBeenCalledWith(
      'password123',
      'hashedPassword',
    );
    expect(authService.generateToken).toHaveBeenCalledWith(user);
    expect(result).toEqual({
      token: 'jwt-token',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
      },
    });
  });

  it('should throw if user does not exist', async () => {
    const command = new LoginUserCommand('notfound@example.com', 'password123');
    mockQueryBus.execute.mockResolvedValue(null);
    await expect(handler.execute(command)).rejects.toThrow(
      'Credenciales inválidas',
    );
    expect(queryBus.execute).toHaveBeenCalledWith(
      expect.any(GetUserByEmailQuery),
    );
    expect(authService.comparePassword).not.toHaveBeenCalled();
    expect(authService.generateToken).not.toHaveBeenCalled();
  });

  it('should throw if user is inactive', async () => {
    const command = new LoginUserCommand('inactive@example.com', 'password123');
    const user = {
      id: 'user-2',
      email: 'inactive@example.com',
      password: 'hashedPassword',
      isActive: false,
    };
    mockQueryBus.execute.mockResolvedValue(user);
    await expect(handler.execute(command)).rejects.toThrow('Usuario inactivo');
    expect(authService.comparePassword).not.toHaveBeenCalled();
    expect(authService.generateToken).not.toHaveBeenCalled();
  });

  it('should throw if password is invalid', async () => {
    const command = new LoginUserCommand('test@example.com', 'wrongpassword');
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashedPassword',
      isActive: true,
    };
    mockQueryBus.execute.mockResolvedValue(user);
    mockAuthService.comparePassword.mockResolvedValue(false);
    await expect(handler.execute(command)).rejects.toThrow(
      'Credenciales inválidas',
    );
    expect(authService.comparePassword).toHaveBeenCalledWith(
      'wrongpassword',
      'hashedPassword',
    );
    expect(authService.generateToken).not.toHaveBeenCalled();
  });
});
