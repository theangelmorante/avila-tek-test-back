import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOrderItemsHandler } from './update-order-items.handler';
import { UpdateOrderItemsCommand } from '../commands/update-order-items.command';
import { ORDER_REPOSITORY } from '../../domain/tokens';
import { PRODUCT_REPOSITORY } from '../../../products/domain/tokens';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

const mockTx = {
  order: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  orderItem: {
    deleteMany: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockPrismaService = {
  $transaction: jest.fn().mockImplementation(async (callback) => {
    return await callback(mockTx);
  }),
};

describe('UpdateOrderItemsHandler', () => {
  let handler: UpdateOrderItemsHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderItemsHandler,
        {
          provide: ORDER_REPOSITORY,
          useValue: {},
        },
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    handler = module.get<UpdateOrderItemsHandler>(UpdateOrderItemsHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const command = new UpdateOrderItemsCommand('order-1', 'user-1', [
    { productId: 'prod-new', quantity: 1 },
  ]);

  const existingOrder = {
    id: 'order-1',
    userId: 'user-1',
    status: 'PENDING',
    orderItems: [{ productId: 'prod-old', quantity: 2 }],
  };

  const productNew = {
    id: 'prod-new',
    name: 'New Product',
    stock: 5,
    price: new Decimal(50),
  };

  it('should successfully update order items', async () => {
    mockTx.order.findUnique.mockResolvedValue(existingOrder);
    mockTx.product.findUnique.mockResolvedValue(productNew);
    mockTx.order.update.mockResolvedValue({ id: 'order-1' });

    const result = await handler.execute(command);

    expect(mockPrismaService.$transaction).toHaveBeenCalled();
    expect(mockTx.order.findUnique).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      include: { orderItems: true },
    });
    expect(mockTx.product.findUnique).toHaveBeenCalledWith({
      where: { id: 'prod-new' },
    });
    expect(mockTx.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-old' },
      data: { stock: { increment: 2 } },
    });
    expect(mockTx.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-new' },
      data: { stock: { increment: -1 } },
    });
    expect(mockTx.orderItem.deleteMany).toHaveBeenCalledWith({
      where: { orderId: 'order-1' },
    });
    expect(mockTx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: {
        totalAmount: 50,
        orderItems: {
          create: [
            { productId: 'prod-new', quantity: 1, price: new Decimal(50) },
          ],
        },
      },
    });
    expect(result).toEqual({ id: 'order-1' });
  });

  it('should throw NotFoundException if order not found', async () => {
    mockTx.order.findUnique.mockResolvedValue(null);
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not the owner', async () => {
    mockTx.order.findUnique.mockResolvedValue({
      ...existingOrder,
      userId: 'another-user',
    });
    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException for non-updatable order status', async () => {
    mockTx.order.findUnique.mockResolvedValue({
      ...existingOrder,
      status: 'SHIPPED',
    });
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if new product not found', async () => {
    mockTx.order.findUnique.mockResolvedValue(existingOrder);
    mockTx.product.findUnique.mockResolvedValue(null);
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for insufficient stock', async () => {
    mockTx.order.findUnique.mockResolvedValue(existingOrder);
    mockTx.product.findUnique.mockResolvedValue({ ...productNew, stock: 0 });
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });
});
