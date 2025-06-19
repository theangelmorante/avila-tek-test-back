import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order, OrderStatus } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { PaginatedResult } from '../../../../shared/domain/dto/pagination.dto';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return null;
    }

    const orderItems = order.orderItems.map(
      (item) =>
        new OrderItem(
          item.id,
          item.orderId,
          item.productId,
          item.quantity,
          Number(item.price),
          item.createdAt,
          item.updatedAt,
        ),
    );

    return new Order(
      order.id,
      order.userId,
      order.status as OrderStatus,
      Number(order.totalAmount),
      orderItems,
      order.createdAt,
      order.updatedAt,
    );
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Order>> {
    const offset = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.order.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders.map((order) => {
        const orderItems = order.orderItems.map(
          (item) =>
            new OrderItem(
              item.id,
              item.orderId,
              item.productId,
              item.quantity,
              Number(item.price),
              item.createdAt,
              item.updatedAt,
            ),
        );

        return new Order(
          order.id,
          order.userId,
          order.status as OrderStatus,
          Number(order.totalAmount),
          orderItems,
          order.createdAt,
          order.updatedAt,
        );
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async save(order: Order): Promise<Order> {
    // Crear el pedido
    const savedOrder = await this.prisma.order.create({
      data: {
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        orderItems: {
          create: order.orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    const orderItems = savedOrder.orderItems.map(
      (item) =>
        new OrderItem(
          item.id,
          item.orderId,
          item.productId,
          item.quantity,
          Number(item.price),
          item.createdAt,
          item.updatedAt,
        ),
    );

    return new Order(
      savedOrder.id,
      savedOrder.userId,
      savedOrder.status as OrderStatus,
      Number(savedOrder.totalAmount),
      orderItems,
      savedOrder.createdAt,
      savedOrder.updatedAt,
    );
  }

  async update(order: Order): Promise<Order> {
    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        totalAmount: order.totalAmount,
      },
      include: {
        orderItems: true,
      },
    });

    const orderItems = updatedOrder.orderItems.map(
      (item) =>
        new OrderItem(
          item.id,
          item.orderId,
          item.productId,
          item.quantity,
          Number(item.price),
          item.createdAt,
          item.updatedAt,
        ),
    );

    return new Order(
      updatedOrder.id,
      updatedOrder.userId,
      updatedOrder.status as OrderStatus,
      Number(updatedOrder.totalAmount),
      orderItems,
      updatedOrder.createdAt,
      updatedOrder.updatedAt,
    );
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: { id },
    });

    return count > 0;
  }
}
