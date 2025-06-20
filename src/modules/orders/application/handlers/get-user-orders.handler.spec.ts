import { Test, TestingModule } from '@nestjs/testing';
import { GetUserOrdersHandler } from './get-user-orders.handler';
import { GetUserOrdersQuery } from '../queries/get-user-orders.query';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';

describe('GetUserOrdersHandler', () => {
  let handler: GetUserOrdersHandler;
  let orderRepository: IOrderRepository;

  const mockOrderRepository = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserOrdersHandler,
        { provide: ORDER_REPOSITORY, useValue: mockOrderRepository },
      ],
    }).compile();

    handler = module.get<GetUserOrdersHandler>(GetUserOrdersHandler);
    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return a paginated list of user orders', async () => {
    const query = new GetUserOrdersQuery('user-1', 1, 10);
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
    const paginatedResult = {
      data: [order],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
    mockOrderRepository.findByUserId.mockResolvedValue(paginatedResult);

    const result = await handler.execute(query);

    expect(orderRepository.findByUserId).toHaveBeenCalledWith('user-1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: 'order-1',
        userId: 'user-1',
        status: 'CONFIRMED',
        totalAmount: 200,
        itemCount: 2,
        orderItems: expect.any(Array),
      }),
    );
    expect(result.data[0]).toHaveProperty('createdAt');
    expect(result.data[0]).toHaveProperty('updatedAt');
    expect(result.pagination).toEqual(paginatedResult.pagination);
  });
});
