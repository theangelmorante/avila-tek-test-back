import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';

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

  async findAll(includeInactive: boolean = false): Promise<Product[]> {
    const where = includeInactive ? {} : { isActive: true };

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return products.map(
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
    );
  }

  async findAvailable(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(
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
    );
  }

  async save(product: Product): Promise<Product> {
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
