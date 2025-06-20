import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { DeleteProductCommand } from '../commands/delete-product.command';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler
  implements ICommandHandler<DeleteProductCommand>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    const { id } = command;

    // Check if the product exists
    const exists = await this.productRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Product not found');
    }

    // Delete the product
    await this.productRepository.delete(id);
  }
}
