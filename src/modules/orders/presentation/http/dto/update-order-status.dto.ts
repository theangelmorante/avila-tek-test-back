import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../domain/entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'El estado debe ser uno de los valores válidos',
  })
  status: OrderStatus;
}
