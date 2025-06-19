import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAvailableProductsQuery } from '../queries/get-available-products.query';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';

export class GetAvailableProductsHandler
  implements IQueryHandler<GetAvailableProductsQuery>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetAvailableProductsQuery): Promise<any[]> {
    const products = await this.productRepository.findAvailable();

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
