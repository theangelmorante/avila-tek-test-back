import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductHandler } from './create-product.handler';
import { CreateProductCommand } from '../commands/create-product.command';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';
import { Product } from '../../domain/entities/product.entity';

// Mock del repositorio de productos
const mockProductRepository = {
  save: jest.fn(),
};

describe('CreateProductHandler', () => {
  let handler: CreateProductHandler;
  let productRepository: IProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductHandler,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateProductHandler>(CreateProductHandler);
    productRepository = module.get<IProductRepository>(PRODUCT_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create and save a new product successfully', async () => {
      // Arrange
      const command = new CreateProductCommand(
        'New Laptop',
        'A powerful new laptop',
        1500.99,
        50,
      );

      const productEntity = Product.create(
        command.name,
        command.description,
        command.price,
        command.stock,
      );

      mockProductRepository.save.mockResolvedValue(productEntity);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(productRepository.save).toHaveBeenCalledWith(expect.any(Product));
      expect(result).toEqual({
        id: productEntity.id,
        name: productEntity.name,
      });
    });

    it('should throw an error if the repository fails', async () => {
      // Arrange
      const command = new CreateProductCommand(
        'Failed Laptop',
        'This will fail',
        100,
        10,
      );
      const error = new Error('Database connection failed');
      mockProductRepository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(error);
      expect(productRepository.save).toHaveBeenCalledWith(expect.any(Product));
    });
  });
});
