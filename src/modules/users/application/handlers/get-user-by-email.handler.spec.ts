import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByEmailHandler } from './get-user-by-email.handler';
import { GetUserByEmailQuery } from '../queries/get-user-by-email.query';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/tokens';

describe('GetUserByEmailHandler', () => {
  let handler: GetUserByEmailHandler;
  let userRepository: IUserRepository;

  const mockUserRepository = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByEmailHandler,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
      ],
    }).compile();

    handler = module.get<GetUserByEmailHandler>(GetUserByEmailHandler);
    userRepository = module.get<IUserRepository>(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return the user if found', async () => {
    const query = new GetUserByEmailQuery('test@example.com');
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUserRepository.findByEmail.mockResolvedValue(user);

    const result = await handler.execute(query);

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual(
      expect.objectContaining({
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        isActive: true,
      }),
    );
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
  });

  it('should return null if user is not found', async () => {
    const query = new GetUserByEmailQuery('notfound@example.com');
    mockUserRepository.findByEmail.mockResolvedValue(null);
    const result = await handler.execute(query);
    expect(result).toBeNull();
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'notfound@example.com',
    );
  });
});
