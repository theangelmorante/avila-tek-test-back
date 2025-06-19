import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateProductCommand } from '../commands/create-product.command';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';

export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    command: CreateProductCommand,
  ): Promise<{ id: string; name: string }> {
    const { name, description, price, stock } = command;

    // Crear el producto
    const product = Product.create(name, description, price, stock);

    // Guardar el producto
    const savedProduct = await this.productRepository.save(product);

    return {
      id: savedProduct.id,
      name: savedProduct.name,
    };
  }
}
