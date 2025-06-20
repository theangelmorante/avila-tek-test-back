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

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Configurar pipes globales
    app.useGlobalPipes(new CustomValidationPipe());

    // Configurar filtro de excepciones global
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Configurar interceptor de respuesta global
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Configurar CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('Avila Tek E-commerce API')
      .setDescription(
        'API REST escalable para una plataforma de comercio electrónico',
      )
      .setVersion('1.0')
      .addTag('auth', 'Endpoints de autenticación')
      .addTag('users', 'Gestión de usuarios')
      .addTag('products', 'Gestión de inventario de productos')
      .addTag('orders', 'Procesamiento de pedidos de clientes')
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

    logger.log(`🚀 Aplicación iniciada en el puerto ${port}`);
    logger.log(
      `📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`,
    );
  } catch (error) {
    logger.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();
