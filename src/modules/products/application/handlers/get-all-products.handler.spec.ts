import { Test, TestingModule } from '@nestjs/testing';
import { GetAllProductsHandler } from './get-all-products.handler';
import { GetAllProductsQuery } from '../queries/get-all-products.query';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';
import { Product } from '../../domain/entities/product.entity';

// Mock del repositorio de productos
const mockProductRepository = {
  findAll: jest.fn(),
};

describe('GetAllProductsHandler', () => {
  let handler: GetAllProductsHandler;
  let productRepository: IProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllProductsHandler,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    handler = module.get<GetAllProductsHandler>(GetAllProductsHandler);
    productRepository = module.get<IProductRepository>(PRODUCT_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a paginated list of all products', async () => {
      // Arrange
      const query = new GetAllProductsQuery(true, 1, 10);
      const product = Product.create('Test Product', 'Description', 100, 10);
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

      mockProductRepository.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(productRepository.findAll).toHaveBeenCalledWith(
        query.includeInactive,
        query.page,
        query.limit,
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should call repository with default pagination when not provided', async () => {
      // Arrange
      const query = new GetAllProductsQuery(false, undefined, undefined);
      const product = Product.create('Test Product', 'Description', 100, 10);
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

      mockProductRepository.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(productRepository.findAll).toHaveBeenCalledWith(false, 1, 10);
      expect(result).toEqual(paginatedResult);
    });
  });
});
