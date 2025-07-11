import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, BadRequestException } from '@nestjs/common';
import { CreateOrderCommand } from '../commands/create-order.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';
import { PRODUCT_REPOSITORY } from '../../../products/domain/tokens';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { UpdateProductCommand } from '../../../products/application/commands/update-product.command';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
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
          throw new BadRequestException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (!product.isActive) {
          this.logger.warn(`Product inactive: ${item.productId}`);
          throw new BadRequestException(
            `Product with ID ${item.productId} is not available`,
          );
        }

        if (product.stock < item.quantity) {
          this.logger.warn(
            `Insufficient stock for product: ${item.productId} - Stock: ${product.stock}, Requested: ${item.quantity}`,
          );
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}`,
          );
        }

        // Create the order item
        const orderItem = OrderItem.create(
          item.productId,
          item.quantity,
          product.price,
        );

        orderItems.push(orderItem);
        totalAmount += product.price * item.quantity;

        // Dispatch command to update the product stock
        const newStock = product.stock - item.quantity;
        await this.commandBus.execute(
          new UpdateProductCommand(
            item.productId,
            undefined,
            undefined,
            undefined,
            newStock,
          ),
        );

        this.logger.debug(
          `Stock update command dispatched for product: ${item.productId} - New stock: ${newStock}`,
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
