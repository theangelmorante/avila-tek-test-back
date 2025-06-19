import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly status: OrderStatus,
    public readonly totalAmount: number,
    public readonly orderItems: OrderItem[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(userId: string, orderItems: OrderItem[]): Order {
    const totalAmount = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0,
    );

    return new Order(
      undefined as any, // ID será generado por la base de datos
      userId,
      OrderStatus.PENDING,
      totalAmount,
      orderItems,
      new Date(),
      new Date(),
    );
  }

  canBeCancelled(): boolean {
    return (
      this.status === OrderStatus.PENDING ||
      this.status === OrderStatus.CONFIRMED
    );
  }

  canBeUpdated(): boolean {
    return (
      this.status !== OrderStatus.DELIVERED &&
      this.status !== OrderStatus.CANCELLED
    );
  }

  updateStatus(newStatus: OrderStatus): Order {
    return new Order(
      this.id,
      this.userId,
      newStatus,
      this.totalAmount,
      this.orderItems,
      this.createdAt,
      new Date(),
    );
  }

  getItemCount(): number {
    return this.orderItems.reduce((total, item) => total + item.quantity, 0);
  }
}
