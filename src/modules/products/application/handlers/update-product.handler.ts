import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { UpdateProductCommand } from '../commands/update-product.command';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';

export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    command: UpdateProductCommand,
  ): Promise<{ id: string; name: string }> {
    const { id, name, description, price, stock, isActive } = command;

    // Buscar el producto existente
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Actualizar el producto
    const updatedProduct = existingProduct.update(
      name,
      description,
      price,
      stock,
      isActive,
    );

    // Guardar el producto actualizado
    const savedProduct = await this.productRepository.update(updatedProduct);

    return {
      id: savedProduct.id,
      name: savedProduct.name,
    };
  }
}
