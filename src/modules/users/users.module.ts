import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Domain
import { USER_REPOSITORY } from './domain/tokens';

// Application
import { CreateUserHandler } from './application/handlers/create-user.handler';
import { GetUserByIdHandler } from './application/handlers/get-user-by-id.handler';
import { GetUserByEmailHandler } from './application/handlers/get-user-by-email.handler';

// Infrastructure
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';

// Presentation
import { UsersController } from './presentation/http/controllers/users.controller';

// Shared
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

const CommandHandlers = [CreateUserHandler];
const QueryHandlers = [GetUserByIdHandler, GetUserByEmailHandler];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [
    // Shared
    PrismaService,

    // Domain interfaces
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },

    // Application handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [USER_REPOSITORY, ...CommandHandlers, ...QueryHandlers],
})
export class UsersModule {}
