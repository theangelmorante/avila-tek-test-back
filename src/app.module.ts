import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PrismaService } from './shared/infrastructure/prisma/prisma.service';
import appConfig from './shared/infrastructure/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
