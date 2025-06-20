import { Test, TestingModule } from '@nestjs/testing';
import { GetAvailableProductsHandler } from './get-available-products.handler';
import { GetAvailableProductsQuery } from '../queries/get-available-products.query';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';
import { Product } from '../../domain/entities/product.entity';

// Mock del repositorio de productos
const mockProductRepository = {
  findAvailable: jest.fn(),
};

describe('GetAvailableProductsHandler', () => {
  let handler: GetAvailableProductsHandler;
  let productRepository: IProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAvailableProductsHandler,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    handler = module.get<GetAvailableProductsHandler>(
      GetAvailableProductsHandler,
    );
    productRepository = module.get<IProductRepository>(PRODUCT_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a paginated list of available products', async () => {
      // Arrange
      const query = new GetAvailableProductsQuery(1, 10);
      const product = Product.create('Test Product', 'Description', 100, 10);
      (product as any).id = 'product-id';

      const paginatedResult = {
        data: [product],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockProductRepository.findAvailable.mockResolvedValue(paginatedResult);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(productRepository.findAvailable).toHaveBeenCalledWith(
        query.page,
        query.limit,
      );
      expect(result.pagination).toEqual(paginatedResult.pagination);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toEqual(product.id);
    });
  });
});
