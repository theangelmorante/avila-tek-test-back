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
import { CreateOrderCommand } from '../../../application/commands/create-order.command';
import { UpdateOrderStatusCommand } from '../../../application/commands/update-order-status.command';
import { GetOrderByIdQuery } from '../../../application/queries/get-order-by-id.query';
import { GetUserOrdersQuery } from '../../../application/queries/get-user-orders.query';
import { PaginationDto } from '../../../../../shared/domain/dto/pagination.dto';

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
    summary: 'Crear un nuevo pedido',
    description: 'Crea un nuevo pedido con los productos especificados',
  })
  @ApiBody({
    type: CreateOrderDto,
    description: 'Datos del pedido a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o stock insuficiente',
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    this.logger.log(`Creando pedido para usuario: ${userId}`);

    const command = new CreateOrderCommand(userId, createOrderDto.items);
    const result = await this.commandBus.execute(command);

    this.logger.log(
      `Pedido creado exitosamente: ${result.id} - Total: $${result.totalAmount}`,
    );

    return {
      message: 'Pedido creado exitosamente',
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener historial de pedidos del usuario',
    description:
      'Obtiene una lista paginada de todos los pedidos del usuario autenticado',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Pedidos obtenidos exitosamente',
  })
  async getUserOrders(
    @Request() req: any,
    @Query() paginationDto?: PaginationDto,
  ) {
    const userId = req.user.id;
    this.logger.log(
      `Obteniendo pedidos del usuario: ${userId} (página: ${paginationDto?.page || 1})`,
    );

    const query = new GetUserOrdersQuery(
      userId,
      paginationDto?.page || 1,
      paginationDto?.limit || 10,
    );
    const result = await this.queryBus.execute(query);

    this.logger.log(
      `Pedidos obtenidos: ${result.data.length} de ${result.pagination.total}`,
    );

    return {
      message: 'Pedidos obtenidos exitosamente',
      ...result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener pedido por ID',
    description:
      'Obtiene un pedido específico por su ID (solo del usuario autenticado)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pedido',
    example: 'clxabcdef1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado',
  })
  async getOrderById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    this.logger.log(`Obteniendo pedido: ${id} para usuario: ${userId}`);

    const query = new GetOrderByIdQuery(id, userId);
    const order = await this.queryBus.execute(query);

    this.logger.log(`Pedido obtenido: ${order.id} - Estado: ${order.status}`);

    return {
      message: 'Pedido obtenido exitosamente',
      data: order,
    };
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar estado del pedido',
    description: 'Actualiza el estado de un pedido específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pedido',
    example: 'clxabcdef1234',
  })
  @ApiBody({
    type: UpdateOrderStatusDto,
    description: 'Nuevo estado del pedido',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del pedido actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede actualizar el estado de este pedido',
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    this.logger.log(
      `Actualizando estado del pedido: ${id} a ${updateOrderStatusDto.status} para usuario: ${userId}`,
    );

    const command = new UpdateOrderStatusCommand(
      id,
      userId,
      updateOrderStatusDto.status,
    );
    const result = await this.commandBus.execute(command);

    this.logger.log(
      `Estado del pedido actualizado: ${result.id} - Nuevo estado: ${result.status}`,
    );

    return {
      message: 'Estado del pedido actualizado exitosamente',
      data: result,
    };
  }
}
