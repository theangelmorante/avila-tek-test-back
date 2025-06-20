import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { PaginatedResult } from '../../../../shared/domain/dto/pagination.dto';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return null;
    }

    return new Product(
      product.id,
      product.name,
      product.description,
      Number(product.price),
      product.stock,
      product.isActive,
      product.createdAt,
      product.updatedAt,
    );
  }

  async findAll(
    includeInactive: boolean = false,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Product>> {
    const where = includeInactive ? {} : { isActive: true };
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map(
        (product) =>
          new Product(
            product.id,
            product.name,
            product.description,
            Number(product.price),
            product.stock,
            product.isActive,
            product.createdAt,
            product.updatedAt,
          ),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findAvailable(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Product>> {
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          isActive: true,
          stock: { gt: 0 },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.product.count({
        where: {
          isActive: true,
          stock: { gt: 0 },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map(
        (product) =>
          new Product(
            product.id,
            product.name,
            product.description,
            Number(product.price),
            product.stock,
            product.isActive,
            product.createdAt,
            product.updatedAt,
          ),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async save(product: Product): Promise<Product> {
    if (product.id) {
      return this.update(product);
    }

    const savedProduct = await this.prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive,
      },
    });

    return new Product(
      savedProduct.id,
      savedProduct.name,
      savedProduct.description,
      Number(savedProduct.price),
      savedProduct.stock,
      savedProduct.isActive,
      savedProduct.createdAt,
      savedProduct.updatedAt,
    );
  }

  async update(product: Product): Promise<Product> {
    const updatedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive,
      },
    });

    return new Product(
      updatedProduct.id,
      updatedProduct.name,
      updatedProduct.description,
      Number(updatedProduct.price),
      updatedProduct.stock,
      updatedProduct.isActive,
      updatedProduct.createdAt,
      updatedProduct.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { id },
    });

    return count > 0;
  }
}
