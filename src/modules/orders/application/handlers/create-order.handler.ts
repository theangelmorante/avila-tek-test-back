import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CreateOrderCommand } from '../commands/create-order.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';
import { PRODUCT_REPOSITORY } from '../../../products/domain/tokens';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: CreateOrderCommand) {
    this.logger.log(
      `Ejecutando comando CreateOrderCommand para usuario: ${command.userId} con ${command.items.length} productos`,
    );

    try {
      const { userId, items } = command;

      // Validar que todos los productos existan y tengan stock suficiente
      const orderItems: OrderItem[] = [];
      let totalAmount = 0;

      for (const item of items) {
        this.logger.debug(
          `Validando producto: ${item.productId} - Cantidad: ${item.quantity}`,
        );

        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          this.logger.warn(`Producto no encontrado: ${item.productId}`);
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }

        if (!product.isActive) {
          this.logger.warn(`Producto inactivo: ${item.productId}`);
          throw new Error(
            `Producto con ID ${item.productId} no está disponible`,
          );
        }

        if (product.stock < item.quantity) {
          this.logger.warn(
            `Stock insuficiente para producto: ${item.productId} - Stock: ${product.stock}, Solicitado: ${item.quantity}`,
          );
          throw new Error(
            `Stock insuficiente para el producto ${product.name}`,
          );
        }

        // Crear el item del pedido
        const orderItem = OrderItem.create(
          item.productId,
          product.name,
          product.price,
          item.quantity,
        );

        orderItems.push(orderItem);
        totalAmount += product.price * item.quantity;

        // Actualizar el stock del producto
        product.updateStock(product.stock - item.quantity);
        await this.productRepository.save(product);

        this.logger.debug(
          `Stock actualizado para producto: ${item.productId} - Nuevo stock: ${product.stock}`,
        );
      }

      // Crear el pedido
      const order = Order.create(userId, orderItems);

      // Guardar el pedido
      const savedOrder = await this.orderRepository.save(order);

      this.logger.log(
        `Pedido creado exitosamente: ${savedOrder.id} - Total: $${savedOrder.totalAmount}`,
      );

      return {
        id: savedOrder.id,
        totalAmount: savedOrder.totalAmount,
      };
    } catch (error) {
      this.logger.error(`Error al crear pedido: ${error.message}`, error.stack);
      throw error;
    }
  }
}
