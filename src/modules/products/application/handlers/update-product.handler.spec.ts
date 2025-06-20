import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductHandler } from './update-product.handler';
import { UpdateProductCommand } from '../commands/update-product.command';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';
import { Product } from '../../domain/entities/product.entity';

// Mock del repositorio de productos
const mockProductRepository = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('UpdateProductHandler', () => {
  let handler: UpdateProductHandler;
  let productRepository: IProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProductHandler,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    handler = module.get<UpdateProductHandler>(UpdateProductHandler);
    productRepository = module.get<IProductRepository>(PRODUCT_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should update an existing product successfully', async () => {
      // Arrange
      const command = new UpdateProductCommand(
        'product-id',
        'Updated Name',
        'Updated description',
        2000,
        100,
        true,
      );

      const existingProduct = Product.create(
        'Old Name',
        'Old description',
        1000,
        50,
      );
      // Asignamos un ID para simular un producto existente
      (existingProduct as any).id = 'product-id';

      const updatedProductEntity = existingProduct.update(
        command.name,
        command.description,
        command.price,
        command.stock,
        command.isActive,
      );

      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.update.mockResolvedValue(updatedProductEntity);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(productRepository.findById).toHaveBeenCalledWith(command.id);
      expect(productRepository.update).toHaveBeenCalledWith(
        updatedProductEntity,
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: updatedProductEntity.id,
          name: updatedProductEntity.name,
        }),
      );
    });

    it('should throw a NotFoundException if the product does not exist', async () => {
      // Arrange
      const command = new UpdateProductCommand('non-existent-id');
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new NotFoundException('Producto no encontrado'),
      );

      expect(productRepository.findById).toHaveBeenCalledWith(command.id);
      expect(productRepository.update).not.toHaveBeenCalled();
    });
  });
});
