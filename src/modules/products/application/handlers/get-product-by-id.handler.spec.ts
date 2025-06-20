import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetProductByIdHandler } from './get-product-by-id.handler';
import { GetProductByIdQuery } from '../queries/get-product-by-id.query';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';
import { Product } from '../../domain/entities/product.entity';

// Mock del repositorio de productos
const mockProductRepository = {
  findById: jest.fn(),
};

describe('GetProductByIdHandler', () => {
  let handler: GetProductByIdHandler;
  let productRepository: IProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductByIdHandler,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    handler = module.get<GetProductByIdHandler>(GetProductByIdHandler);
    productRepository = module.get<IProductRepository>(PRODUCT_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a product if it is found', async () => {
      // Arrange
      const productId = 'product-id';
      const query = new GetProductByIdQuery(productId);
      const productEntity = Product.create(
        'Test Product',
        'Description',
        100,
        10,
      );
      (productEntity as any).id = productId;

      mockProductRepository.findById.mockResolvedValue(productEntity);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(productRepository.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual({
        id: productEntity.id,
        name: productEntity.name,
        description: productEntity.description,
        price: productEntity.price,
        stock: productEntity.stock,
        isActive: productEntity.isActive,
        isAvailable: productEntity.isAvailable(),
        createdAt: productEntity.createdAt,
        updatedAt: productEntity.updatedAt,
      });
    });

    it('should throw a NotFoundException if the product is not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const query = new GetProductByIdQuery(productId);
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(
        new NotFoundException('Order not found'),
      );
      expect(productRepository.findById).toHaveBeenCalledWith(productId);
    });
  });
});
