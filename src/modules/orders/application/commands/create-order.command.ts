import { ICommand } from '@nestjs/cqrs';

export interface OrderItemDto {
  productId: string;
  quantity: number;
}

export class CreateOrderCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly items: OrderItemDto[],
  ) {}
}
