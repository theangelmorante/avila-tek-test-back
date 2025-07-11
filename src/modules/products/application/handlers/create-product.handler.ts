import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CreateProductCommand } from '../commands/create-product.command';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { PRODUCT_REPOSITORY } from '../../domain/tokens';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  private readonly logger = new Logger(CreateProductHandler.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    command: CreateProductCommand,
  ): Promise<{ id: string; name: string }> {
    this.logger.log(`Executing CreateProductCommand: ${command.name}`);

    const { name, description, price, stock } = command;

    // Create the product
    const product = Product.create(name, description, price, stock);

    try {
      // Save the product
      const savedProduct = await this.productRepository.save(product);

      this.logger.log(
        `Product created successfully: ${savedProduct.id} - ${savedProduct.name}`,
      );

      return {
        id: savedProduct.id,
        name: savedProduct.name,
      };
    } catch (error) {
      this.logger.error(
        `Error creating product: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
