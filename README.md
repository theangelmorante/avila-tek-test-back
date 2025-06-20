<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fes.linkedin.com%2Fcompany%2Favilatek&psig=AOvVaw3J7nC30VBjc0pEse0O35eC&ust=1750510578619000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLig-ZyGgI4DFQAAAAAdAAAAABAE" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://www.google.com/url?sa=i&url=https%3A%2F%2Fes.linkedin.com%2Fcompany%2Favilatek&psig=AOvVaw3J7nC30VBjc0pEse0O35eC&ust=1750510578619000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLig-ZyGgI4DFQAAAAAdAAAAABAE
[circleci-url]: https://www.avilatek.com/en

# Avila Tek E-commerce API

Scalable REST API for an e-commerce platform built with NestJS, TypeScript, and Prisma.

## Architecture

This project implements a **Hexagonal Architecture** with **CQRS (Command Query Responsibility Segregation)** for each module:

- **Domain Layer**: Entities, repository interfaces, and services.
- **Application Layer**: Commands, queries, and handlers (CQRS).
- **Infrastructure Layer**: Concrete implementations, controllers, DTOs.

## Technologies

- **NestJS**: Node.js framework.
- **TypeScript**: Programming language.
- **Prisma**: Database ORM.
- **PostgreSQL**: Database.
- **JWT**: Authentication.
- **bcryptjs**: Password hashing.
- **class-validator**: Data validation.

## Getting Started (Development Mode)

This project is set up to run in a hybrid environment: the database runs in a Docker container, and the NestJS application runs locally on your machine.

### Prerequisites

- Node.js (v18 or higher)
- Yarn
- Docker and Docker Compose

### Step 1: Start the Database

The `docker-compose.yml` file contains the configuration for the PostgreSQL service. To start the database, run:

```bash
# Start the database container in the background
docker-compose up -d
```

The database will be available at `localhost:5432`.

### Step 2: Set Up Environment Variables

Copy the `env.example` file to a new file named `.env` in the project root. The file should contain the following variables:

**`.env` file:**

```env
# Database (pointing to Docker)
DATABASE_URL="postgresql://avilatek_user:avilatek_password@localhost:5432/avilatek_db?schema=public"

# JWT
JWT_SECRET="your-development-secret"
JWT_EXPIRES_IN="24h"

# App
PORT=3000
NODE_ENV=development

# Frontend (Optional)
FRONTEND_URL="http://localhost:3001"
```

### Step 3: Run the Application

Once the database is running and the `.env` file is configured, open a terminal in the project root and run the following commands in order:

```bash
# 1. Install dependencies
yarn install

# 2. Apply database migrations
npx prisma migrate deploy

# 3. Generate the Prisma client
npx prisma generate

# 4. Start the server in development mode (with hot-reload)
yarn start:dev
```

The application will be available at `http://localhost:3000`.

## API Documentation

The API documentation is generated using Swagger and is available at:

- **Swagger UI:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Once the application is running, you can access this URL to view all available endpoints, test them, and see the request/response models.

## Authentication and Authorization

### Global Authentication

The application uses **global JWT authentication**, which is automatically applied to all endpoints. This means:

- **By default**: All endpoints require a valid JWT.
- **Public endpoints**: Are marked with the `@Public()` decorator to allow access without authentication.

### @Public Decorator

To mark an endpoint as public (no authentication required), use the `@Public()` decorator:

```typescript
import { Public } from '../shared/domain/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  @Public()
  @Post('register')
  async register() {
    // This endpoint is public
  }

  @Public()
  @Post('login')
  async login() {
    // This endpoint is public
  }

  @Get('profile')
  async getProfile() {
    // This endpoint requires authentication (by default)
  }
}
```

### Using JWT Tokens

For protected endpoints, include the JWT in the authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

### Authentication (`/auth`)

#### User Registration

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com"
  }
}
```

#### User Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe"
    }
  }
}
```

### Users (`/users`)

#### Get User Profile

```http
GET /users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Products (`/products`)

#### Create Product

```http
POST /products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "description": "High-performance laptop for gaming",
  "price": 1299.99,
  "stock": 10
}
```

**Response:**

```json
{
  "message": "Product created successfully",
  "data": {
    "id": "clx1234567890",
    "name": "Gaming Laptop"
  }
}
```

#### Get All Products (with pagination)

```http
GET /products?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "clx1234567890",
      "name": "Gaming Laptop",
      "description": "High-performance laptop for gaming",
      "price": 1299.99,
      "stock": 10,
      "isActive": true,
      "isAvailable": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Available Products (with pagination)

```http
GET /products/available?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "message": "Available products retrieved successfully",
  "data": [
    {
      "id": "clx1234567890",
      "name": "Gaming Laptop",
      "description": "High-performance laptop for gaming",
      "price": 1299.99,
      "stock": 10,
      "isActive": true,
      "isAvailable": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Product by ID

```http
GET /products/clx1234567890
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "message": "Product retrieved successfully",
  "data": {
    "id": "clx1234567890",
    "name": "Gaming Laptop",
    "description": "High-performance laptop for gaming",
    "price": 1299.99,
    "stock": 10,
    "isActive": true,
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Product

```http
PUT /products/clx1234567890
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Gaming Laptop Pro",
  "price": 1499.99,
  "stock": 5
}
```

**Response:**

```json
{
  "message": "Product updated successfully",
  "data": {
    "id": "clx1234567890",
    "name": "Gaming Laptop Pro"
  }
}
```

#### Delete Product

```http
DELETE /products/clx1234567890
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "message": "Product deleted successfully"
}
```

### Orders (`/orders`)

#### Create Order

```http
POST /orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "items": [
    {
      "productId": "clx1234567890",
      "quantity": 2
    },
    {
      "productId": "clx0987654321",
      "quantity": 1
    }
  ]
}
```

**Response:**

```json
{
  "message": "Order created successfully",
  "data": {
    "id": "clxabcdef1234",
    "totalAmount": 2599.98
  }
}
```

#### Get User's Order History (with pagination)

```http
GET /orders?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "clxabcdef1234",
      "userId": "clx1234567890",
      "status": "PENDING",
      "totalAmount": 2599.98,
      "itemCount": 3,
      "orderItems": [
        {
          "id": "clxitem123",
          "productId": "clx1234567890",
          "quantity": 2,
          "price": 1299.99,
          "subtotal": 2599.98
        },
        {
          "id": "clxitem456",
          "productId": "clx0987654321",
          "quantity": 1,
          "price": 999.99,
          "subtotal": 999.99
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Get Order by ID

```http
GET /orders/clxabcdef1234
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "message": "Order retrieved successfully",
  "data": {
    "id": "clxabcdef1234",
    "userId": "clx1234567890",
    "status": "PENDING",
    "totalAmount": 2599.98,
    "itemCount": 3,
    "orderItems": [
      {
        "id": "clxitem123",
        "productId": "clx1234567890",
        "quantity": 2,
        "price": 1299.99,
        "subtotal": 2599.98
      },
      {
        "id": "clxitem456",
        "productId": "clx0987654321",
        "quantity": 1,
        "price": 999.99,
        "subtotal": 999.99
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Order Status

```http
PUT /orders/clxabcdef1234/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

**Response:**

```json
{
  "message": "Order status updated successfully",
  "data": {
    "id": "clxabcdef1234",
    "status": "CONFIRMED"
  }
}
```

**Available Statuses:**

- `PENDING`
- `CONFIRMED`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

## Pagination

The API implements pagination on all endpoints that return lists:

### Pagination Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Example Usage

```http
GET /products?page=2&limit=20
GET /orders?page=1&limit=5
```

### Paginated Response

```json
{
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Performance Optimizations

### Database Indexes

The API includes optimized indexes to improve query performance:

- **Users**: `email`, `isActive`
- **Products**: `isActive`, `isActive + stock`, `createdAt`
- **Orders**: `userId`, `userId + createdAt`, `status`, `createdAt`
- **OrderItems**: `orderId`, `productId`

### Optimized Queries

- **Efficient Pagination**: Uses `skip` and `take` with appropriate indexes.
- **Parallel Queries**: Counts and data fetching run in parallel for better performance.
- **Optimized Relations**: Efficient loading of related data.

## Project Structure

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
│   ├── users/
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   └── create-user.command.ts
│   │   │   ├── queries/
│   │   │   │   ├── get-user-by-id.query.ts
│   │   │   │   └── get-user-by-email.query.ts
│   │   │   └── handlers/
│   │   │       ├── create-user.handler.ts
│   │   │       ├── get-user-by-id.handler.ts
│   │   │       └── get-user-by-email.handler.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   ├── repositories/
│   │   │   │   └── user.repository.interface.ts
│   │   │   └── tokens.ts
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       └── prisma-user.repository.ts
│   │   └── presentation/
│   │       └── http/
│   │           └── controllers/
│   │               └── users.controller.ts
│   ├── products/
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── create-product.command.ts
│   │   │   │   ├── update-product.command.ts
│   │   │   │   └── delete-product.command.ts
│   │   │   ├── queries/
│   │   │   │   ├── get-product-by-id.query.ts
│   │   │   │   ├── get-all-products.query.ts
│   │   │   │   └── get-available-products.query.ts
│   │   │   └── handlers/
│   │   │       ├── create-product.handler.ts
│   │   │       ├── update-product.handler.ts
│   │   │       ├── delete-product.handler.ts
│   │   │       ├── get-product-by-id.handler.ts
│   │   │       ├── get-all-products.handler.ts
│   │   │       └── get-available-products.handler.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── product.entity.ts
│   │   │   ├── repositories/
│   │   │   │   └── product.repository.interface.ts
│   │   │   └── tokens.ts
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       └── prisma-product.repository.ts
│   │   └── presentation/
│   │       └── http/
│   │           ├── controllers/
│   │           │   └── products.controller.ts
│   │           └── dto/
│   │               ├── create-product.dto.ts
│   │               └── update-product.dto.ts
│   └── orders/
│       ├── application/
│       │   ├── commands/
│       │   │   ├── create-order.command.ts
│       │   │   └── update-order-status.command.ts
│       │   ├── queries/
│       │   │   ├── get-order-by-id.query.ts
│       │   │   └── get-user-orders.query.ts
│       │   └── handlers/
│       │       ├── create-order.handler.ts
│       │       ├── update-order-status.handler.ts
│       │       ├── get-order-by-id.handler.ts
│       │       └── get-user-orders.handler.ts
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── order.entity.ts
│       │   │   └── order-item.entity.ts
│       │   ├── repositories/
│       │   │   └── order.repository.interface.ts
│       │   └── tokens.ts
│       ├── infrastructure/
│       │   └── persistence/
│       │       └── prisma-order.repository.ts
│       └── presentation/
│           └── http/
│               ├── controllers/
│               │   └── orders.controller.ts
│               └── dto/
│                   ├── create-order.dto.ts
│                   └── update-order-status.dto.ts
├── shared/
│   ├── domain/
│   │   └── decorators/
│   │       └── public.decorator.ts
│   └── infrastructure/
│       └── prisma/
│           └── prisma.service.ts
└── app.module.ts
```

## Implemented Features

### ✅ User Authentication

- [x] User registration with validation
- [x] Login with JWT
- [x] Global JWT authentication
- [x] @Public decorator for public endpoints
- [x] Secure password hashing with bcrypt
- [x] JWT token validation

### ✅ User Management

- [x] User creation
- [x] Query users by ID and email
- [x] User profile endpoint
- [x] Separation of concerns between modules

### ✅ Product Inventory Management

- [x] Create products with name, description, price, and stock
- [x] Update products (partial or full)
- [x] Delete products
- [x] List all products (active/inactive) with pagination
- [x] List available products (active with stock > 0) with pagination
- [x] Get product by ID
- [x] Data validation with class-validator
- [x] Stock availability control

### ✅ Customer Order Processing

- [x] Create orders with multiple products
- [x] Real-time stock validation
- [x] Automatic inventory updates
- [x] Order history per user with pagination
- [x] Get specific order by ID
- [x] Update order status
- [x] Order statuses: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- [x] Automatic total calculation
- [x] Order ownership validation (only the owner can view/modify)

### ✅ Scalability and Efficiency

- [x] **Full pagination** on all listings
- [x] **Optimized database indexes** for frequent queries
- [x] **Parallel queries** for better performance
- [x] **Modular architecture** allowing for horizontal scaling
- [x] **CQRS** separating read and write operations
- [x] **Rate limiting** to prevent overload

### ✅ Data Storage and Management

- [x] **PostgreSQL** as the main database
- [x] **Well-defined schemas** with entity relationships
- [x] **Referential integrity** with foreign keys
- [x] **Automatic migrations** with Prisma
- [x] **Database-level validations**
- [x] **Data consistency** guaranteed by transactions

### ✅ Hexagonal Architecture

- [x] Clear separation of layers (Domain, Application, Infrastructure, Presentation)
- [x] Dependency inversion with interfaces
- [x] Dependency injection with tokens
- [x] Independent modules with specific responsibilities

### ✅ CQRS

- [x] Commands for write operations (register, login, product CRUD, orders)
- [x] Queries for read operations (profile, product search, order history)
- [x] Specialized handlers for each operation
- [x] Inter-module communication via CommandBus/QueryBus

### ✅ Security

- [x] Data validation with class-validator
- [x] Password hashing
- [x] JWTs with expiration
- [x] Automatic protection of sensitive routes
- [x] Controlled public endpoints
- [x] Resource ownership validation

## Next Steps

1. **Customer Management**: Additional user information
2. **Tests**: Unit and integration
3. **Documentation**: Swagger/OpenAPI
4. **Logging**: Structured logging system
5. **Monitoring**: Metrics and health checks
6. **Payments**: Integration with payment gateways
7. **Notifications**: Email/SMS notification system
8. **Caching**: Redis implementation for frequent queries
9. **CDN**: For images and static assets
10. **Load Balancing**: For traffic distribution

## Author

**Angel Morante**

- **Bento:** [bento.me/angel-morante](https://bento.me/angel-morante)
- **Website:** [angel-morante.vercel.app](https://angel-morante.vercel.app/)
- **LinkedIn:** [Angel Morante](https://www.linkedin.com/in/angel-morante-aa76461a9/)
- **Twitter:** [@theangelmorante](https://twitter.com/theangelmorante)
