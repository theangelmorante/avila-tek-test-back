import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { UpdateOrderItemsDto } from '../dto/update-order-items.dto';
import { CreateOrderCommand } from '../../../application/commands/create-order.command';
import { UpdateOrderStatusCommand } from '../../../application/commands/update-order-status.command';
import { UpdateOrderItemsCommand } from '../../../application/commands/update-order-items.command';
import { GetOrderByIdQuery } from '../../../application/queries/get-order-by-id.query';
import { GetUserOrdersQuery } from '../../../application/queries/get-user-orders.query';
import { PaginationDto } from '../../../../../shared/domain/dto/pagination.dto';
import { CurrentUser } from '../../../../../shared/domain/decorators/current-user.decorator';
import { OrderStatus } from '../../../domain/entities/order.entity';

@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Create a new order with the specified products',
  })
  @ApiBody({
    type: CreateOrderDto,
    description: 'Data of the order to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or insufficient stock',
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: { id: string },
  ) {
    const userId = user.id;
    this.logger.log(`Creating order for user: ${userId}`);

    const command = new CreateOrderCommand(userId, createOrderDto.items);
    const result = await this.commandBus.execute(command);

    this.logger.log(
      `Order created successfully: ${result.id} - Total: $${result.totalAmount}`,
    );

    return {
      message: 'Order created successfully',
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user order history',
    description:
      'Get a paginated list of all orders for the authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elements per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Orders obtained successfully',
  })
  async getUserOrders(
    @CurrentUser() user: { id: string },
    @Query() paginationDto?: PaginationDto,
  ) {
    const userId = user.id;
    this.logger.log(
      `Getting orders for user: ${userId} (page: ${paginationDto?.page || 1})`,
    );

    const query = new GetUserOrdersQuery(
      userId,
      paginationDto?.page || 1,
      paginationDto?.limit || 10,
    );
    const result = await this.queryBus.execute(query);

    this.logger.log(
      `Orders obtained: ${result.data.length} of ${result.pagination.total}`,
    );

    return {
      message: 'Orders obtained successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Get a specific order by its ID (only for the authenticated user)',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID to get',
    example: 'clxabcdef1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Order obtained successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found or user does not have access',
  })
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const userId = user.id;
    this.logger.log(`Getting order: ${id} for user: ${userId}`);

    const query = new GetOrderByIdQuery(id, userId);
    const order = await this.queryBus.execute(query);

    this.logger.log(`Order obtained: ${order.id} - Status: ${order.status}`);

    return {
      message: 'Order obtained successfully',
      data: order,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update order items',
    description:
      'Replaces the items of an existing order. This operation is atomic.',
  })
  @ApiParam({ name: 'id', description: 'Order ID to update' })
  @ApiBody({ type: UpdateOrderItemsDto })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({
    status: 400,
    description:
      'Invalid data, lack of stock or the order cannot be modified or user does not have access',
  })
  @ApiResponse({
    status: 404,
    description: 'Order or product not found or user does not have access',
  })
  async updateOrderItems(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderItemsDto,
    @CurrentUser() user: { id: string },
  ) {
    const command = new UpdateOrderItemsCommand(id, user.id, updateDto.items);
    const result = await this.commandBus.execute(command);
    return {
      message: 'Order items updated successfully',
      data: result,
    };
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update order status',
    description: 'Update the status of a specific order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'clxabcdef1234',
  })
  @ApiBody({
    type: UpdateOrderStatusDto,
    description: 'New order status',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update order status',
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: { id: string },
  ) {
    const userId = user.id;
    this.logger.log(
      `Updating order status: ${id} to ${updateOrderStatusDto.status} for user: ${userId}`,
    );

    const command = new UpdateOrderStatusCommand(
      id,
      userId,
      updateOrderStatusDto.status,
    );
    const result = await this.commandBus.execute(command);

    this.logger.log(
      `Order status updated: ${result.id} - New status: ${result.status}`,
    );

    return {
      message: 'Order status updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel an order',
    description: 'Cancel a specific order if its status allows it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID to cancel',
    example: 'clxabcdef1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Order cannot be cancelled',
  })
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const userId = user.id;
    this.logger.log(`Cancelling order: ${id} for user: ${userId}`);

    const command = new UpdateOrderStatusCommand(
      id,
      userId,
      OrderStatus.CANCELLED,
    );
    const result = await this.commandBus.execute(command);

    this.logger.log(`Order cancelled successfully: ${result.id}`);

    return {
      message: 'Order cancelled successfully',
      data: result,
    };
  }
}
