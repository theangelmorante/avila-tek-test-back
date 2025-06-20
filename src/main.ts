import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import {
  ResponseInterceptor,
  GlobalExceptionFilter,
  ValidationPipe as CustomValidationPipe,
} from './shared/infrastructure';
import {
  corsOptions,
  helmetOptions,
} from './shared/infrastructure/config/security.config';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Configure Helmet for security headers
    app.use(helmet(helmetOptions));

    // Configure CORS with specific options
    app.enableCors(corsOptions);

    // Configure global pipes
    app.useGlobalPipes(new CustomValidationPipe());

    // Configure global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Configure global response interceptor
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Configure Swagger
    const config = new DocumentBuilder()
      .setTitle('Avila Tek E-commerce API')
      .setDescription('Scalable REST API for an e-commerce platform')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('products', 'Product inventory management')
      .addTag('orders', 'Customer order processing')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 Application started on port ${port}`);
    logger.log(
      `📚 Swagger documentation available at: http://localhost:${port}/api/docs`,
    );
    logger.log(`🔒 Security headers and CORS configured`);
  } catch (error) {
    logger.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
