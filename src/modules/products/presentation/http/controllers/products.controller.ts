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
    this.logger.log(`Creating product: ${createProductDto.name}`);

    const command = new CreateProductCommand(
      createProductDto.name,
      createProductDto.description || null,
      createProductDto.price,
      createProductDto.stock,
    );

    const result = await this.commandBus.execute(command);

    this.logger.log(`Product created successfully: ${result.id}`);

    return {
      message: 'Product created successfully',
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
      `Products obtained: ${result.data.length} of ${result.pagination.total}`,
    );

    return {
      message: 'Products obtained successfully',
      data: result.data,
      pagination: result.pagination,
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
    description: 'Available products obtained successfully',
  })
  async getAvailableProducts(@Query() paginationDto?: PaginationDto) {
    this.logger.log(
      `Getting available products (page: ${paginationDto?.page || 1})`,
    );

    const query = new GetAvailableProductsQuery(
      paginationDto?.page || 1,
      paginationDto?.limit || 10,
    );
    const result = await this.queryBus.execute(query);

    this.logger.log(
      `Available products obtained: ${result.data.length} of ${result.pagination.total}`,
    );

    return {
      message: 'Available products obtained successfully',
      data: result.data,
      pagination: result.pagination,
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
    description: 'Product obtained successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getProductById(@Param('id') id: string) {
    this.logger.log(`Getting product by ID: ${id}`);

    const query = new GetProductByIdQuery(id);
    const product = await this.queryBus.execute(query);

    this.logger.log(`Product obtained: ${product.name}`);

    return {
      message: 'Product obtained successfully',
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
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    this.logger.log(`Updating product: ${id}`);

    const command = new UpdateProductCommand(
      id,
      updateProductDto.name,
      updateProductDto.description,
      updateProductDto.price,
      updateProductDto.stock,
      updateProductDto.isActive,
    );

    const result = await this.commandBus.execute(command);

    this.logger.log(`Product updated successfully: ${result.id}`);

    return {
      message: 'Product updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
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
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async deleteProduct(@Param('id') id: string) {
    this.logger.log(`Deleting product: ${id}`);

    const command = new DeleteProductCommand(id);
    await this.commandBus.execute(command);

    this.logger.log(`Product deleted successfully: ${id}`);

    return {
      message: 'Product deleted successfully',
    };
  }
}
