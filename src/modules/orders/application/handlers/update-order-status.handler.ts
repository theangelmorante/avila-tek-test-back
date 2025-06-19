import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateOrderStatusCommand } from '../commands/update-order-status.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ORDER_REPOSITORY } from '../../domain/tokens';

export class UpdateOrderStatusHandler
  implements ICommandHandler<UpdateOrderStatusCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    command: UpdateOrderStatusCommand,
  ): Promise<{ id: string; status: string }> {
    const { orderId, userId, status } = command;

    // Buscar el pedido
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Verificar que el pedido pertenece al usuario
    if (order.userId !== userId) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Verificar si se puede actualizar el estado
    if (!order.canBeUpdated()) {
      throw new BadRequestException(
        'No se puede actualizar el estado de este pedido',
      );
    }

    // Actualizar el estado
    const updatedOrder = order.updateStatus(status);

    // Guardar el pedido actualizado
    const savedOrder = await this.orderRepository.update(updatedOrder);

    return {
      id: savedOrder.id,
      status: savedOrder.status,
    };
  }
}
