import { Order } from '../entities/order.entity';
import { PaginatedResult } from '../../../../shared/domain/dto/pagination.dto';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Order>>;
  save(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  existsById(id: string): Promise<boolean>;
}
