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
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateProductCommand } from '../../../application/commands/create-product.command';
import { UpdateProductCommand } from '../../../application/commands/update-product.command';
import { DeleteProductCommand } from '../../../application/commands/delete-product.command';
import { GetProductByIdQuery } from '../../../application/queries/get-product-by-id.query';
import { GetAllProductsQuery } from '../../../application/queries/get-all-products.query';
import { GetAvailableProductsQuery } from '../../../application/queries/get-available-products.query';
import { PaginationDto } from '../../../../../shared/domain/dto/pagination.dto';

@ApiTags('products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo producto',
    description: 'Crea un nuevo producto en el inventario',
  })
  @ApiBody({
    type: CreateProductDto,
    description: 'Datos del producto a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    this.logger.log(`Creando producto: ${createProductDto.name}`);

    const command = new CreateProductCommand(
      createProductDto.name,
      createProductDto.description || null,
      createProductDto.price,
      createProductDto.stock,
    );

    const result = await this.commandBus.execute(command);

    this.logger.log(`Producto creado exitosamente: ${result.id}`);

    return {
      message: 'Producto creado exitosamente',
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los productos',
    description: 'Obtiene una lista paginada de todos los productos',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir productos inactivos',
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
    description: 'Productos obtenidos exitosamente',
  })
  async getAllProducts(
    @Query('includeInactive') includeInactive?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    this.logger.log(
      `Obteniendo productos (página: ${paginationDto?.page || 1})`,
    );

    const query = new GetAllProductsQuery(
      includeInactive === 'true',
      paginationDto?.page || 1,
      paginationDto?.limit || 10,
    );
    const result = await this.queryBus.execute(query);

    this.logger.log(
      `Productos obtenidos: ${result.data.length} de ${result.pagination.total}`,
    );

    return {
      message: 'Productos obtenidos exitosamente',
      ...result,
    };
  }

  @Get('available')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener productos disponibles',
    description:
      'Obtiene una lista paginada de productos activos con stock > 0',
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
    description: 'Productos disponibles obtenidos exitosamente',
  })
  async getAvailableProducts(@Query() paginationDto?: PaginationDto) {
    this.logger.log(
      `Obteniendo productos disponibles (página: ${paginationDto?.page || 1})`,
    );

    const query = new GetAvailableProductsQuery(
      paginationDto?.page || 1,
      paginationDto?.limit || 10,
    );
    const result = await this.queryBus.execute(query);

    this.logger.log(
      `Productos disponibles obtenidos: ${result.data.length} de ${result.pagination.total}`,
    );

    return {
      message: 'Productos disponibles obtenidos exitosamente',
      ...result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener producto por ID',
    description: 'Obtiene un producto específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async getProductById(@Param('id') id: string) {
    this.logger.log(`Obteniendo producto por ID: ${id}`);

    const query = new GetProductByIdQuery(id);
    const product = await this.queryBus.execute(query);

    this.logger.log(`Producto obtenido: ${product.name}`);

    return {
      message: 'Producto obtenido exitosamente',
      data: product,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar producto',
    description: 'Actualiza un producto existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    example: 'clx1234567890',
  })
  @ApiBody({
    type: UpdateProductDto,
    description: 'Datos del producto a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    this.logger.log(`Actualizando producto: ${id}`);

    const command = new UpdateProductCommand(
      id,
      updateProductDto.name,
      updateProductDto.description,
      updateProductDto.price,
      updateProductDto.stock,
      updateProductDto.isActive,
    );

    const result = await this.commandBus.execute(command);

    this.logger.log(`Producto actualizado exitosamente: ${result.id}`);

    return {
      message: 'Producto actualizado exitosamente',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar producto',
    description: 'Elimina un producto del inventario',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 204,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async deleteProduct(@Param('id') id: string) {
    this.logger.log(`Eliminando producto: ${id}`);

    const command = new DeleteProductCommand(id);
    await this.commandBus.execute(command);

    this.logger.log(`Producto eliminado exitosamente: ${id}`);

    return {
      message: 'Producto eliminado exitosamente',
    };
  }
}
