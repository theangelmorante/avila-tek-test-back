import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Domain
import { PRODUCT_REPOSITORY } from './domain/tokens';

// Application
import { CreateProductHandler } from './application/handlers/create-product.handler';
import { UpdateProductHandler } from './application/handlers/update-product.handler';
import { DeleteProductHandler } from './application/handlers/delete-product.handler';
import { GetProductByIdHandler } from './application/handlers/get-product-by-id.handler';
import { GetAllProductsHandler } from './application/handlers/get-all-products.handler';
import { GetAvailableProductsHandler } from './application/handlers/get-available-products.handler';

// Infrastructure
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';

// Presentation
import { ProductsController } from './presentation/http/controllers/products.controller';

// Shared
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

const CommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
];
const QueryHandlers = [
  GetProductByIdHandler,
  GetAllProductsHandler,
  GetAvailableProductsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [ProductsController],
  providers: [
    // Shared
    PrismaService,

    // Domain interfaces
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },

    // Application handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [PRODUCT_REPOSITORY, ...CommandHandlers, ...QueryHandlers],
})
export class ProductsModule {}
