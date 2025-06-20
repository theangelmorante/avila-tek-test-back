import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { UpdateProductCommand } from '../commands/update-product.command';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';

@CommandHandler(UpdateProductCommand)
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

    // Check if the product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // Update the product
    const updatedProduct = existingProduct.update(
      name,
      description,
      price,
      stock,
      isActive,
    );

    // Save the updated product
    const savedProduct = await this.productRepository.update(updatedProduct);

    return {
      id: savedProduct.id,
      name: savedProduct.name,
    };
  }
}
