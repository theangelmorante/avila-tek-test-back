import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { CreateOrderCommand } from '../commands/create-order.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { ORDER_REPOSITORY, PRODUCT_REPOSITORY } from '../../domain/tokens';

export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    command: CreateOrderCommand,
  ): Promise<{ id: string; totalAmount: number }> {
    const { userId, items } = command;

    if (!items || items.length === 0) {
      throw new BadRequestException(
        'El pedido debe contener al menos un producto',
      );
    }

    // Validar productos y stock
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product) {
        throw new BadRequestException(
          `Producto con ID ${item.productId} no encontrado`,
        );
      }

      if (!product.isAvailable()) {
        throw new BadRequestException(
          `Producto ${product.name} no está disponible`,
        );
      }

      if (!product.hasStock(item.quantity)) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
        );
      }

      // Crear item del pedido
      const orderItem = OrderItem.create(
        undefined as any, // orderId se asignará después
        item.productId,
        item.quantity,
        product.price,
      );

      orderItems.push(orderItem);
      totalAmount += orderItem.subtotal;

      // Actualizar stock del producto
      const updatedProduct = product.updateStock(product.stock - item.quantity);
      await this.productRepository.update(updatedProduct);
    }

    // Crear el pedido
    const order = Order.create(userId, orderItems);

    // Guardar el pedido
    const savedOrder = await this.orderRepository.save(order);

    return {
      id: savedOrder.id,
      totalAmount: savedOrder.totalAmount,
    };
  }
}
