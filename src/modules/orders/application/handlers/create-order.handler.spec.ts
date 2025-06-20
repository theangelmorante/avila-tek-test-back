import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderHandler } from './create-order.handler';
import { CreateOrderCommand } from '../commands/create-order.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';
import { PRODUCT_REPOSITORY } from '../../../products/domain/tokens';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';

const mockOrderRepository = {
  save: jest.fn(),
};
const mockProductRepository = {
  findById: jest.fn(),
  save: jest.fn(),
};

describe('CreateOrderHandler', () => {
  let handler: CreateOrderHandler;
  let orderRepository: IOrderRepository;
  let productRepository: IProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderHandler,
        { provide: ORDER_REPOSITORY, useValue: mockOrderRepository },
        { provide: PRODUCT_REPOSITORY, useValue: mockProductRepository },
      ],
    }).compile();

    handler = module.get<CreateOrderHandler>(CreateOrderHandler);
    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
    productRepository = module.get<IProductRepository>(PRODUCT_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create an order successfully', async () => {
    // Arrange
    const userId = 'user-1';
    const items = [
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-2', quantity: 1 },
    ];
    const command = new CreateOrderCommand(userId, items);

    const product1 = {
      id: 'prod-1',
      name: 'Product 1',
      price: 100,
      stock: 5,
      isActive: true,
      updateStock: jest.fn(),
      save: jest.fn(),
    };
    const product2 = {
      id: 'prod-2',
      name: 'Product 2',
      price: 50,
      stock: 2,
      isActive: true,
      updateStock: jest.fn(),
      save: jest.fn(),
    };

    mockProductRepository.findById
      .mockResolvedValueOnce(product1)
      .mockResolvedValueOnce(product2);
    mockProductRepository.save.mockResolvedValue(undefined);

    const orderItems = [
      OrderItem.create('prod-1', 'Product 1', 100, 2),
      OrderItem.create('prod-2', 'Product 2', 50, 1),
    ];
    const orderEntity = Order.create(userId, orderItems);
    (orderEntity as any).id = 'order-1';
    mockOrderRepository.save.mockResolvedValue(orderEntity);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(productRepository.findById).toHaveBeenCalledTimes(2);
    expect(productRepository.save).toHaveBeenCalledTimes(2);
    expect(orderRepository.save).toHaveBeenCalledWith(expect.any(Order));
    expect(result).toEqual({
      id: 'order-1',
      totalAmount: orderEntity.totalAmount,
    });
  });

  it('should throw if a product does not exist', async () => {
    const userId = 'user-1';
    const items = [{ productId: 'prod-1', quantity: 1 }];
    const command = new CreateOrderCommand(userId, items);
    mockProductRepository.findById.mockResolvedValueOnce(null);

    await expect(handler.execute(command)).rejects.toThrow(
      'Producto con ID prod-1 no encontrado',
    );
    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(orderRepository.save).not.toHaveBeenCalled();
  });

  it('should throw if a product is inactive', async () => {
    const userId = 'user-1';
    const items = [{ productId: 'prod-1', quantity: 1 }];
    const command = new CreateOrderCommand(userId, items);
    const product = {
      id: 'prod-1',
      name: 'Product 1',
      price: 100,
      stock: 5,
      isActive: false,
    };
    mockProductRepository.findById.mockResolvedValueOnce(product);

    await expect(handler.execute(command)).rejects.toThrow(
      'Producto con ID prod-1 no está disponible',
    );
    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(orderRepository.save).not.toHaveBeenCalled();
  });

  it('should throw if there is not enough stock', async () => {
    const userId = 'user-1';
    const items = [{ productId: 'prod-1', quantity: 10 }];
    const command = new CreateOrderCommand(userId, items);
    const product = {
      id: 'prod-1',
      name: 'Product 1',
      price: 100,
      stock: 2,
      isActive: true,
    };
    mockProductRepository.findById.mockResolvedValueOnce(product);

    await expect(handler.execute(command)).rejects.toThrow(
      'Stock insuficiente para el producto Product 1',
    );
    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(orderRepository.save).not.toHaveBeenCalled();
  });
});
