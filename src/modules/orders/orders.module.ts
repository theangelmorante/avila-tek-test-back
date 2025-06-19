import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Domain
import { ORDER_REPOSITORY, PRODUCT_REPOSITORY } from './domain/tokens';

// Application
import { CreateOrderHandler } from './application/handlers/create-order.handler';
import { UpdateOrderStatusHandler } from './application/handlers/update-order-status.handler';
import { GetOrderByIdHandler } from './application/handlers/get-order-by-id.handler';
import { GetUserOrdersHandler } from './application/handlers/get-user-orders.handler';

// Infrastructure
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';

// Presentation
import { OrdersController } from './presentation/http/controllers/orders.controller';

// Shared
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

// Products Module (para obtener el repositorio de productos)
import { ProductsModule } from '../products/products.module';

const CommandHandlers = [CreateOrderHandler, UpdateOrderStatusHandler];
const QueryHandlers = [GetOrderByIdHandler, GetUserOrdersHandler];

@Module({
  imports: [CqrsModule, ProductsModule],
  controllers: [OrdersController],
  providers: [
    // Shared
    PrismaService,

    // Domain interfaces
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },

    // Application handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ORDER_REPOSITORY, ...CommandHandlers, ...QueryHandlers],
})
export class OrdersModule {}
