import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderHandler } from './create-order.handler';
import { CreateOrderCommand } from '../commands/create-order.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';
import { PRODUCT_REPOSITORY } from '../../../products/domain/tokens';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateProductCommand } from '../../../products/application/commands/update-product.command';
import { BadRequestException } from '@nestjs/common';

const mockOrderRepository = {
  save: jest.fn(),
};
const mockProductRepository = {
  findById: jest.fn(),
};
const mockCommandBus = {
  execute: jest.fn(),
};

describe('CreateOrderHandler', () => {
  let handler: CreateOrderHandler;
  let orderRepository: IOrderRepository;
  let productRepository: IProductRepository;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderHandler,
        { provide: ORDER_REPOSITORY, useValue: mockOrderRepository },
        { provide: PRODUCT_REPOSITORY, useValue: mockProductRepository },
        { provide: CommandBus, useValue: mockCommandBus },
      ],
    }).compile();

    handler = module.get<CreateOrderHandler>(CreateOrderHandler);
    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
    productRepository = module.get<IProductRepository>(PRODUCT_REPOSITORY);
    commandBus = module.get<CommandBus>(CommandBus);
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
    };
    const product2 = {
      id: 'prod-2',
      name: 'Product 2',
      price: 50,
      stock: 2,
      isActive: true,
    };

    mockProductRepository.findById
      .mockResolvedValueOnce(product1)
      .mockResolvedValueOnce(product2);
    mockCommandBus.execute.mockResolvedValue(undefined);

    const orderItems = [
      OrderItem.create('prod-1', 2, 100),
      OrderItem.create('prod-2', 1, 50),
    ];
    const orderEntity = Order.create(userId, orderItems);
    (orderEntity as any).id = 'order-1';
    mockOrderRepository.save.mockResolvedValue(orderEntity);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(productRepository.findById).toHaveBeenCalledTimes(2);
    expect(commandBus.execute).toHaveBeenCalledTimes(2);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateProductCommand('prod-1', undefined, undefined, undefined, 3),
    );
    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateProductCommand('prod-2', undefined, undefined, undefined, 1),
    );
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
      new BadRequestException('Product with ID prod-1 not found'),
    );
    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    expect(commandBus.execute).not.toHaveBeenCalled();
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
      new BadRequestException('Product with ID prod-1 is not available'),
    );
    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    expect(commandBus.execute).not.toHaveBeenCalled();
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
      new BadRequestException('Insufficient stock for product Product 1'),
    );
    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(orderRepository.save).not.toHaveBeenCalled();
  });
});
