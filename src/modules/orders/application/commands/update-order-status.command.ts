import { ICommand } from '@nestjs/cqrs';
import { OrderStatus } from '../../domain/entities/order.entity';

export class UpdateOrderStatusCommand implements ICommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly status: OrderStatus,
  ) {}
}
