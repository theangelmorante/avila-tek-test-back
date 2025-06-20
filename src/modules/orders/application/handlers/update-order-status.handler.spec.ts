import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateOrderStatusHandler } from './update-order-status.handler';
import { UpdateOrderStatusCommand } from '../commands/update-order-status.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';
import { OrderStatus } from '../../domain/entities/order.entity';

const mockOrderRepository = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('UpdateOrderStatusHandler', () => {
  let handler: UpdateOrderStatusHandler;
  let orderRepository: IOrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderStatusHandler,
        { provide: ORDER_REPOSITORY, useValue: mockOrderRepository },
      ],
    }).compile();

    handler = module.get<UpdateOrderStatusHandler>(UpdateOrderStatusHandler);
    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should update the order status successfully', async () => {
    const command = new UpdateOrderStatusCommand(
      'order-1',
      'user-1',
      OrderStatus.CONFIRMED,
    );
    const order = {
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.PENDING,
      canBeUpdated: () => true,
      updateStatus: jest
        .fn()
        .mockReturnValue({ id: 'order-1', status: OrderStatus.CONFIRMED }),
    };
    const updatedOrder = { id: 'order-1', status: OrderStatus.CONFIRMED };
    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderRepository.update.mockResolvedValue(updatedOrder);

    const result = await handler.execute(command);

    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
    expect(order.updateStatus).toHaveBeenCalledWith(OrderStatus.CONFIRMED);
    expect(orderRepository.update).toHaveBeenCalledWith(updatedOrder);
    expect(result).toEqual({ id: 'order-1', status: OrderStatus.CONFIRMED });
  });

  it('should throw NotFoundException if the order does not exist', async () => {
    const command = new UpdateOrderStatusCommand(
      'order-1',
      'user-1',
      OrderStatus.CONFIRMED,
    );
    mockOrderRepository.findById.mockResolvedValue(null);
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if the order does not belong to the user', async () => {
    const command = new UpdateOrderStatusCommand(
      'order-1',
      'user-2',
      OrderStatus.CONFIRMED,
    );
    const order = { id: 'order-1', userId: 'user-1', canBeUpdated: () => true };
    mockOrderRepository.findById.mockResolvedValue(order);
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if the order cannot be updated', async () => {
    const command = new UpdateOrderStatusCommand(
      'order-1',
      'user-1',
      OrderStatus.CONFIRMED,
    );
    const order = {
      id: 'order-1',
      userId: 'user-1',
      canBeUpdated: () => false,
      updateStatus: jest.fn(),
    };
    mockOrderRepository.findById.mockResolvedValue(order);
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
    expect(orderRepository.update).not.toHaveBeenCalled();
  });
});
