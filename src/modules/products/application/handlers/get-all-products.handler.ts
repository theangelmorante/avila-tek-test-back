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

  async execute(query: GetAllProductsQuery): Promise<any[]> {
    const { includeInactive } = query;

    const products = await this.productRepository.findAll(includeInactive);

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      isActive: product.isActive,
      isAvailable: product.isAvailable(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  }
}
