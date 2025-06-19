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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateProductCommand } from '../../../application/commands/create-product.command';
import { UpdateProductCommand } from '../../../application/commands/update-product.command';
import { DeleteProductCommand } from '../../../application/commands/delete-product.command';
import { GetProductByIdQuery } from '../../../application/queries/get-product-by-id.query';
import { GetAllProductsQuery } from '../../../application/queries/get-all-products.query';
import { GetAvailableProductsQuery } from '../../../application/queries/get-available-products.query';
import { PaginationDto } from '../../../../../shared/domain/dto/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const command = new CreateProductCommand(
      createProductDto.name,
      createProductDto.description || null,
      createProductDto.price,
      createProductDto.stock,
    );

    const result = await this.commandBus.execute(command);

    return {
      message: 'Producto creado exitosamente',
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProducts(
    @Query('includeInactive') includeInactive?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    const query = new GetAllProductsQuery(
      includeInactive === 'true',
      paginationDto?.page || 1,
      paginationDto?.limit || 10,
    );
    const result = await this.queryBus.execute(query);

    return {
      message: 'Productos obtenidos exitosamente',
      ...result,
    };
  }

  @Get('available')
  @HttpCode(HttpStatus.OK)
  async getAvailableProducts(@Query() paginationDto?: PaginationDto) {
    const query = new GetAvailableProductsQuery(
      paginationDto?.page || 1,
      paginationDto?.limit || 10,
    );
    const result = await this.queryBus.execute(query);

    return {
      message: 'Productos disponibles obtenidos exitosamente',
      ...result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getProductById(@Param('id') id: string) {
    const query = new GetProductByIdQuery(id);
    const product = await this.queryBus.execute(query);

    return {
      message: 'Producto obtenido exitosamente',
      data: product,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const command = new UpdateProductCommand(
      id,
      updateProductDto.name,
      updateProductDto.description,
      updateProductDto.price,
      updateProductDto.stock,
      updateProductDto.isActive,
    );

    const result = await this.commandBus.execute(command);

    return {
      message: 'Producto actualizado exitosamente',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string) {
    const command = new DeleteProductCommand(id);
    await this.commandBus.execute(command);

    return {
      message: 'Producto eliminado exitosamente',
    };
  }
}
