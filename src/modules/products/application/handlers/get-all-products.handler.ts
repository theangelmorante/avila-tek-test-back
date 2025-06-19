import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllProductsQuery } from '../queries/get-all-products.query';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';

export class GetAllProductsHandler
  implements IQueryHandler<GetAllProductsQuery>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetAllProductsQuery): Promise<any> {
    const { includeInactive, page, limit } = query;

    const result = await this.productRepository.findAll(
      includeInactive,
      page,
      limit,
    );

    return {
      data: result.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive,
        isAvailable: product.isAvailable(),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
      pagination: result.pagination,
    };
  }
}
