import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Domain
import { AUTH_SERVICE } from './domain/tokens';

// Application
import { RegisterUserHandler } from './application/handlers/register-user.handler';
import { LoginUserHandler } from './application/handlers/login-user.handler';

// Infrastructure
import { AuthService } from './infrastructure/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

// Presentation
import { AuthController } from './presentation/http/controllers/auth.controller';

// Users Module
import { UsersModule } from '../users/users.module';

const CommandHandlers = [RegisterUserHandler, LoginUserHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Domain interfaces
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },

    // Application handlers
    ...CommandHandlers,

    // Infrastructure
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}
