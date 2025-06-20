import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetAllProductsQuery } from '../queries/get-all-products.query';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';

@QueryHandler(GetAllProductsQuery)
export class GetAllProductsHandler
  implements IQueryHandler<GetAllProductsQuery>
{
  private readonly logger = new Logger(GetAllProductsHandler.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetAllProductsQuery) {
    this.logger.log(
      `Ejecutando query GetAllProductsQuery - Página: ${query.page}, Límite: ${query.limit}, Incluir inactivos: ${query.includeInactive}`,
    );

    try {
      const result = await this.productRepository.findAll(
        query.includeInactive,
        query.page,
        query.limit,
      );

      this.logger.log(
        `Productos obtenidos: ${result.data.length} de ${result.pagination.total} totales`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error al obtener productos: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
