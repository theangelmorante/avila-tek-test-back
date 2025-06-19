import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { CreateOrderCommand } from '../../../application/commands/create-order.command';
import { UpdateOrderStatusCommand } from '../../../application/commands/update-order-status.command';
import { GetOrderByIdQuery } from '../../../application/queries/get-order-by-id.query';
import { GetUserOrdersQuery } from '../../../application/queries/get-user-orders.query';
import { PaginationDto } from '../../../../../shared/domain/dto/pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;

    const command = new CreateOrderCommand(userId, createOrderDto.items);
    const result = await this.commandBus.execute(command);

    return {
      message: 'Pedido creado exitosamente',
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserOrders(
    @Request() req: any,
    @Query() paginationDto?: PaginationDto,
  ) {
    const userId = req.user.id;

    const query = new GetUserOrdersQuery(
      userId,
      paginationDto?.page || 1,
      paginationDto?.limit || 10,
    );
    const result = await this.queryBus.execute(query);

    return {
      message: 'Pedidos obtenidos exitosamente',
      ...result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOrderById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;

    const query = new GetOrderByIdQuery(id, userId);
    const order = await this.queryBus.execute(query);

    return {
      message: 'Pedido obtenido exitosamente',
      data: order,
    };
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;

    const command = new UpdateOrderStatusCommand(
      id,
      userId,
      updateOrderStatusDto.status,
    );
    const result = await this.commandBus.execute(command);

    return {
      message: 'Estado del pedido actualizado exitosamente',
      data: result,
    };
  }
}
