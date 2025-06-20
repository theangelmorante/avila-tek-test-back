import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdHandler } from './get-user-by-id.handler';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/tokens';

describe('GetUserByIdHandler', () => {
  let handler: GetUserByIdHandler;
  let userRepository: IUserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdHandler,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
      ],
    }).compile();

    handler = module.get<GetUserByIdHandler>(GetUserByIdHandler);
    userRepository = module.get<IUserRepository>(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return the user if found', async () => {
    const query = new GetUserByIdQuery('user-1');
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUserRepository.findById.mockResolvedValue(user);

    const result = await handler.execute(query);

    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(
      expect.objectContaining({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        isActive: true,
      }),
    );
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
  });

  it('should throw NotFoundException if user is not found', async () => {
    const query = new GetUserByIdQuery('notfound-id');
    mockUserRepository.findById.mockResolvedValue(null);
    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith('notfound-id');
  });
});
