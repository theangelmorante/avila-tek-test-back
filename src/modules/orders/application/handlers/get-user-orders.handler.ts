import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserOrdersQuery } from '../queries/get-user-orders.query';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';

@QueryHandler(GetUserOrdersQuery)
export class GetUserOrdersHandler implements IQueryHandler<GetUserOrdersQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetUserOrdersQuery): Promise<any> {
    const { userId, page, limit } = query;

    const result = await this.orderRepository.findByUserId(userId, page, limit);

    return {
      data: result.data.map((order) => ({
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
      })),
      pagination: result.pagination,
    };
  }
}
