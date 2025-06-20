import { ICommand } from '@nestjs/cqrs';
import { OrderItemDto } from '../../presentation/http/dto/create-order.dto';

export class UpdateOrderItemsCommand implements ICommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: OrderItemDto[],
  ) {}
}
