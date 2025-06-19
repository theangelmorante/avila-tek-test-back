<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Avila Tek E-commerce API

API REST escalable para una plataforma de comercio electrónico desarrollada con NestJS, TypeScript y Prisma.

## Arquitectura

Este proyecto implementa una **arquitectura hexagonal** con **CQRS (Command Query Responsibility Segregation)** para cada módulo:

- **Domain Layer**: Entidades, interfaces de repositorios y servicios
- **Application Layer**: Comandos, consultas y handlers (CQRS)
- **Infrastructure Layer**: Implementaciones concretas, controladores, DTOs

## Tecnologías

- **NestJS**: Framework de Node.js
- **TypeScript**: Lenguaje de programación
- **Prisma**: ORM para base de datos
- **PostgreSQL**: Base de datos
- **JWT**: Autenticación
- **bcryptjs**: Hash de contraseñas
- **class-validator**: Validación de datos

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `env.example`:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/avilatek_ecommerce?schema=public"

# JWT
JWT_SECRET="tu-super-secreto-jwt-muy-seguro-y-largo-para-produccion"

# App
PORT=3000
NODE_ENV=development
```

### 2. Base de Datos

1. Instala PostgreSQL
2. Crea una base de datos llamada `avilatek_ecommerce`
3. Ejecuta las migraciones:

```bash
# Generar migración inicial
npx prisma migrate dev --name init

# Aplicar migraciones
npx prisma migrate deploy
```

### 3. Instalación de Dependencias

```bash
yarn install
```

## Uso

### Desarrollo

```bash
# Iniciar en modo desarrollo
yarn start:dev
```

### Producción

```bash
# Construir
yarn build

# Iniciar
yarn start:prod
```

## Autenticación y Autorización

### Autenticación Global

La aplicación utiliza **autenticación JWT global** que se aplica automáticamente a todos los endpoints. Esto significa que:

- **Por defecto**: Todos los endpoints requieren un token JWT válido
- **Endpoints públicos**: Se marcan con el decorador `@Public()` para permitir acceso sin autenticación

### Decorador @Public

Para marcar un endpoint como público (sin autenticación), usa el decorador `@Public()`:

```typescript
import { Public } from '../shared/domain/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  @Public()
  @Post('register')
  async register() {
    // Este endpoint es público
  }

  @Public()
  @Post('login')
  async login() {
    // Este endpoint es público
  }

  @Get('profile')
  async getProfile() {
    // Este endpoint requiere autenticación (por defecto)
  }
}
```

### Uso de Tokens JWT

Para endpoints protegidos, incluye el token JWT en el header de autorización:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

### Autenticación (`/auth`)

#### Registro de Usuario

```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Respuesta:**

```json
{
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": "clx1234567890",
    "email": "usuario@ejemplo.com"
  }
}
```

#### Login de Usuario

```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta:**

```json
{
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx1234567890",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "fullName": "Juan Pérez"
    }
  }
}
```

### Usuarios (`/users`)

#### Obtener Perfil de Usuario

```http
GET /users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:**

```json
{
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id": "clx1234567890",
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "fullName": "Juan Pérez",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Estructura del Proyecto

```
src/
├── modules/
│   ├── auth/
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── register-user.command.ts
│   │   │   │   └── login-user.command.ts
│   │   │   └── handlers/
│   │   │       ├── register-user.handler.ts
│   │   │       └── login-user.handler.ts
│   │   ├── domain/
│   │   │   ├── services/
│   │   │   │   └── auth.service.interface.ts
│   │   │   └── tokens.ts
│   │   ├── infrastructure/
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── guards/
│   │   │       └── jwt-auth.guard.ts
│   │   └── presentation/
│   │       └── http/
│   │           ├── controllers/
│   │           │   └── auth.controller.ts
│   │           └── dto/
│   │               ├── register-user.dto.ts
│   │               └── login-user.dto.ts
│   └── users/
│       ├── application/
│       │   ├── commands/
│       │   │   └── create-user.command.ts
│       │   ├── queries/
│       │   │   ├── get-user-by-id.query.ts
│       │   │   └── get-user-by-email.query.ts
│       │   └── handlers/
│       │       ├── create-user.handler.ts
│       │       ├── get-user-by-id.handler.ts
│       │       └── get-user-by-email.handler.ts
│       ├── domain/
│       │   ├── entities/
│       │   │   └── user.entity.ts
│       │   ├── repositories/
│       │   │   └── user.repository.interface.ts
│       │   └── tokens.ts
│       ├── infrastructure/
│       │   └── persistence/
│       │       └── prisma-user.repository.ts
│       └── presentation/
│           └── http/
│               └── controllers/
│                   └── users.controller.ts
├── shared/
│   └── infrastructure/
│       └── prisma/
│           └── prisma.service.ts
└── app.module.ts
```

## Características Implementadas

### ✅ Autenticación de Usuario

- [x] Registro de usuarios con validación
- [x] Login con JWT
- [x] Autenticación global con JWT
- [x] Decorador @Public para endpoints públicos
- [x] Hash seguro de contraseñas con bcrypt
- [x] Validación de tokens JWT

### ✅ Gestión de Usuarios

- [x] Creación de usuarios
- [x] Consulta de usuarios por ID y email
- [x] Endpoint de perfil de usuario
- [x] Separación de responsabilidades entre módulos

### ✅ Arquitectura Hexagonal

- [x] Separación clara de capas (Domain, Application, Infrastructure, Presentation)
- [x] Inversión de dependencias con interfaces
- [x] Inyección de dependencias con tokens
- [x] Módulos independientes con responsabilidades específicas

### ✅ CQRS

- [x] Comandos para operaciones de escritura (registro, login, creación de usuarios)
- [x] Consultas para operaciones de lectura (perfil, búsqueda de usuarios)
- [x] Handlers especializados para cada operación
- [x] Comunicación entre módulos a través de CommandBus/QueryBus

### ✅ Seguridad

- [x] Validación de datos con class-validator
- [x] Hash de contraseñas
- [x] Tokens JWT con expiración
- [x] Protección automática de rutas sensibles
- [x] Endpoints públicos controlados

## Próximos Pasos

1. **Gestión de Inventario**: CRUD de productos
2. **Procesamiento de Pedidos**: Creación y gestión de órdenes
3. **Gestión de Clientes**: Información adicional de usuarios
4. **Tests**: Unitarios e integración
5. **Documentación**: Swagger/OpenAPI
6. **Logging**: Sistema de logs estructurados
7. **Monitoreo**: Métricas y health checks

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
