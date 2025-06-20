import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';
import { PRODUCT_REPOSITORY } from '../../../products/domain/tokens';
import { UpdateOrderItemsCommand } from '../commands/update-order-items.command';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@CommandHandler(UpdateOrderItemsCommand)
export class UpdateOrderItemsHandler
  implements ICommandHandler<UpdateOrderItemsCommand>
{
  private readonly logger = new Logger(UpdateOrderItemsHandler.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: UpdateOrderItemsCommand): Promise<any> {
    const { orderId, userId, items: newItems } = command;
    this.logger.log(`Updating items for order ${orderId}`);

    // Encapsulate the entire logic in a transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }
      if (order.userId !== userId) {
        throw new ForbiddenException('You cannot access this order');
      }
      if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
        throw new BadRequestException(
          `Order cannot be updated in status ${order.status}`,
        );
      }

      const stockChanges = new Map<string, number>();
      order.orderItems.forEach((item) => {
        stockChanges.set(
          item.productId,
          (stockChanges.get(item.productId) || 0) + item.quantity,
        );
      });

      let totalAmount = 0;
      const newOrderItemsData = [];

      for (const item of newItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new BadRequestException(
            `Product with ID ${item.productId} not found`,
          );
        }

        const currentStockChange = stockChanges.get(item.productId) || 0;
        const finalStock = product.stock + currentStockChange - item.quantity;

        if (finalStock < 0) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}`,
          );
        }
        stockChanges.set(item.productId, currentStockChange - item.quantity);

        totalAmount += product.price.toNumber() * item.quantity;
        newOrderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Apply stock changes
      for (const [productId, quantityChange] of stockChanges.entries()) {
        if (quantityChange !== 0) {
          await tx.product.update({
            where: { id: productId },
            data: { stock: { increment: quantityChange } },
          });
        }
      }

      // Update order
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          totalAmount,
          orderItems: { create: newOrderItemsData },
        },
      });

      this.logger.log(`Order ${orderId} items updated successfully.`);
      return { id: updatedOrder.id };
    });
  }
}
