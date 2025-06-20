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
      `Executing CreateOrderCommand for user: ${command.userId} with ${command.items.length} products`,
    );

    try {
      const { userId, items } = command;

      // Check if all products exist and have enough stock
      const orderItems: OrderItem[] = [];
      let totalAmount = 0;

      for (const item of items) {
        this.logger.debug(
          `Checking product: ${item.productId} - Quantity: ${item.quantity}`,
        );

        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          this.logger.warn(`Product not found: ${item.productId}`);
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (!product.isActive) {
          this.logger.warn(`Product inactive: ${item.productId}`);
          throw new Error(`Product with ID ${item.productId} is not available`);
        }

        if (product.stock < item.quantity) {
          this.logger.warn(
            `Insufficient stock for product: ${item.productId} - Stock: ${product.stock}, Requested: ${item.quantity}`,
          );
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        // Create the order item
        const orderItem = OrderItem.create(
          item.productId,
          product.name,
          product.price,
          item.quantity,
        );

        orderItems.push(orderItem);
        totalAmount += product.price * item.quantity;

        // Update the product stock
        product.updateStock(product.stock - item.quantity);
        await this.productRepository.save(product);

        this.logger.debug(
          `Stock updated for product: ${item.productId} - New stock: ${product.stock}`,
        );
      }

      // Create the order
      const order = Order.create(userId, orderItems, totalAmount);

      // Save the order
      const savedOrder = await this.orderRepository.save(order);

      this.logger.log(
        `Order created successfully: ${savedOrder.id} - Total: $${savedOrder.totalAmount}`,
      );

      return {
        id: savedOrder.id,
        totalAmount: savedOrder.totalAmount,
      };
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw error;
    }
  }
}
