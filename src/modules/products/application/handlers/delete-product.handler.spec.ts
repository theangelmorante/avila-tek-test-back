import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteProductHandler } from './delete-product.handler';
import { DeleteProductCommand } from '../commands/delete-product.command';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';

// Mock del repositorio de productos
const mockProductRepository = {
  existsById: jest.fn(),
  delete: jest.fn(),
};

describe('DeleteProductHandler', () => {
  let handler: DeleteProductHandler;
  let productRepository: IProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductHandler,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    handler = module.get<DeleteProductHandler>(DeleteProductHandler);
    productRepository = module.get<IProductRepository>(PRODUCT_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a product successfully if it exists', async () => {
      // Arrange
      const command = new DeleteProductCommand('product-id');
      mockProductRepository.existsById.mockResolvedValue(true);
      mockProductRepository.delete.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(productRepository.existsById).toHaveBeenCalledWith(command.id);
      expect(productRepository.delete).toHaveBeenCalledWith(command.id);
    });

    it('should throw a NotFoundException if the product does not exist', async () => {
      // Arrange
      const command = new DeleteProductCommand('non-existent-id');
      mockProductRepository.existsById.mockResolvedValue(false);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new NotFoundException('Producto no encontrado'),
      );

      expect(productRepository.existsById).toHaveBeenCalledWith(command.id);
      expect(productRepository.delete).not.toHaveBeenCalled();
    });
  });
});
