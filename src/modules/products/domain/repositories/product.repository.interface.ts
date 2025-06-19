import { Product } from '../entities/product.entity';
import { PaginatedResult } from '../../../../shared/domain/dto/pagination.dto';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(
    includeInactive?: boolean,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Product>>;
  findAvailable(
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Product>>;
  save(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
  existsById(id: string): Promise<boolean>;
}
