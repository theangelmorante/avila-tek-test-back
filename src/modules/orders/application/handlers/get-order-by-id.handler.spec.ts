import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetOrderByIdHandler } from './get-order-by-id.handler';
import { GetOrderByIdQuery } from '../queries/get-order-by-id.query';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';

const mockOrderRepository = {
  findById: jest.fn(),
};

describe('GetOrderByIdHandler', () => {
  let handler: GetOrderByIdHandler;
  let orderRepository: IOrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdHandler,
        { provide: ORDER_REPOSITORY, useValue: mockOrderRepository },
      ],
    }).compile();

    handler = module.get<GetOrderByIdHandler>(GetOrderByIdHandler);
    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return the order if it exists and belongs to the user', async () => {
    const query = new GetOrderByIdQuery('order-1', 'user-1');
    const order = {
      id: 'order-1',
      userId: 'user-1',
      status: 'CONFIRMED',
      totalAmount: 200,
      getItemCount: () => 2,
      orderItems: [
        {
          id: 'item-1',
          productId: 'prod-1',
          quantity: 1,
          price: 100,
          subtotal: 100,
        },
        {
          id: 'item-2',
          productId: 'prod-2',
          quantity: 1,
          price: 100,
          subtotal: 100,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockOrderRepository.findById.mockResolvedValue(order);

    const result = await handler.execute(query);

    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
    expect(result).toEqual(
      expect.objectContaining({
        id: 'order-1',
        userId: 'user-1',
        status: 'CONFIRMED',
        totalAmount: 200,
        itemCount: 2,
        orderItems: expect.any(Array),
      }),
    );
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
  });

  it('should throw NotFoundException if the order does not exist', async () => {
    const query = new GetOrderByIdQuery('order-1', 'user-1');
    mockOrderRepository.findById.mockResolvedValue(null);
    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
  });

  it('should throw NotFoundException if the order does not belong to the user', async () => {
    const query = new GetOrderByIdQuery('order-1', 'user-2');
    const order = { id: 'order-1', userId: 'user-1' };
    mockOrderRepository.findById.mockResolvedValue(order);
    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
  });
});
