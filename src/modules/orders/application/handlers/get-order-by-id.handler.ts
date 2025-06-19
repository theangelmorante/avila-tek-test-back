import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetOrderByIdQuery } from '../queries/get-order-by-id.query';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';

export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetOrderByIdQuery): Promise<any> {
    const { orderId, userId } = query;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Verificar que el pedido pertenece al usuario
    if (order.userId !== userId) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.getItemCount(),
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
