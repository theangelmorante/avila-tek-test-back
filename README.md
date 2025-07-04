# Avila Tek E-commerce API

Scalable REST API for an e-commerce platform built with NestJS (Node + Express), TypeScript, and Prisma.

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
npx prisma migrate dev

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

## 📖 API Endpoints

Here is a summary of the available endpoints:

### Auth

| Method | Endpoint         | Description          |
| :----- | :--------------- | :------------------- |
| `POST` | `/auth/register` | Register a new user. |
| `POST` | `/auth/login`    | Login and get a JWT. |

### Users

| Method | Endpoint         | Description                           |
| :----- | :--------------- | :------------------------------------ |
| `GET`  | `/users/:id`     | Get a user by their ID.               |

### Products

| Method   | Endpoint              | Description                                 |
| :------- | :-------------------- | :------------------------------------------ |
| `POST`   | `/products`           | Create a new product.                       |
| `GET`    | `/products`           | Get a paginated list of all products.       |
| `GET`    | `/products/available` | Get available products (active & in stock). |
| `GET`    | `/products/:id`       | Get a product by its ID.                    |
| `PUT`    | `/products/:id`       | Update an existing product.                 |
| `DELETE` | `/products/:id`       | Delete a product.                           |

### Orders

| Method   | Endpoint             | Description                                     |
| :------- | :------------------- | :---------------------------------------------- |
| `POST`   | `/orders`            | Create a new order.                             |
| `GET`    | `/orders`            | Get the authenticated user's order history.     |
| `GET`    | `/orders/:id`        | Get a specific order by its ID.                 |
| `PUT`    | `/orders/:id`        | Update the items of an existing order.          |
| `PUT`    | `/orders/:id/status` | Update the status of an order.                  |
| `DELETE` | `/orders/:id`        | Cancel an order (sets its status to CANCELLED). |

---

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

<!-- ## Endpoints

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
- `CANCELLED` -->

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
│   │   │   └── handlers/
│   │   ├── domain/
│   │   │   ├── services/
│   │   │   └── tokens.ts
│   │   ├── infrastructure/
│   │   │   ├── services/
│   │   │   ├── strategies/
│   │   │   └── guards/
│   │   └── presentation/
│   │       └── http/
│   │           ├── controllers/
│   │           └── dto/
│   ├── users/
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   ├── queries/
│   │   │   └── handlers/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── tokens.ts
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   └── presentation/
│   │       └── http/
│   │           └── controllers/
│   ├── products/
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   ├── queries/
│   │   │   └── handlers/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── tokens.ts
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   └── presentation/
│   │       └── http/
│   │           ├── controllers/
│   │           └── dto/
│   └── orders/
│       ├── application/
│       │   ├── commands/
│       │   ├── queries/
│       │   └── handlers/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── tokens.ts
│       ├── infrastructure/
│       │   └── persistence/
│       └── presentation/
│           └── http/
│               ├── controllers/
│               └── dto/
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

## Suggestions for next steps

1. **Notifications**: Email/SMS notification system
2. **Caching**: Redis implementation for frequent queries
3. **CDN**: For images and static assets
4. **Load Balancing**: For traffic distribution

## Author

**Angel Morante**

- **Bento:** [bento.me/angel-morante](https://bento.me/angel-morante)
- **Website:** [angel-morante.vercel.app](https://angel-morante.vercel.app/)
- **LinkedIn:** [Angel Morante](https://www.linkedin.com/in/angel-morante-aa76461a9/)
- **Twitter:** [@theangelmorante](https://twitter.com/theangelmorante)

## 🚀 Postman Collection

This project includes a Postman collection to easily test all API endpoints.

- **File**: `AvilaTek E-commerce API.postman_collection.json`
- **How to use**:
  1.  Import the file into your Postman client.
  2.  The collection uses a `{{host}}` variable, which is pre-configured to `http://localhost:3000`.
  3.  Run the `Auth - Register` and `Auth - Login` requests first. The login request will automatically save the JWT to a collection variable `{{jwt}}` so you can make authenticated requests seamlessly.
  4.  Remember to replace placeholders like `<REPLACE_WITH_PRODUCT_ID>` in URLs or bodies with actual IDs from your database.

---

## 🧪 Running Tests

To run all unit tests:

```bash
yarn test
```

To run tests with coverage report:

```bash
yarn test --coverage
```

The coverage report will be shown in the terminal and a detailed HTML report will be generated in the `coverage/` folder. You can open `coverage/lcov-report/index.html` in your browser for a visual summary.

### Current Coverage Example

| File                                                              | % Stmts  | % Branch | % Funcs | % Lines   | Uncovered Line #s |
| ----------------------------------------------------------------- | -------- | -------- | ------- | --------- | ----------------- |
| **All files**                                                     | **99.2** | **100**  | **100** | **99.09** | -                 |
| `auth/application/handlers/login-user.handler.ts`                 | 100      | 100      | 100     | 100       | -                 |
| `auth/application/handlers/register-user.handler.ts`              | 100      | 100      | 100     | 100       | -                 |
| `orders/application/handlers/create-order.handler.ts`             | 100      | 100      | 100     | 100       | -                 |
| `orders/application/handlers/get-order-by-id.handler.ts`          | 100      | 100      | 100     | 100       | -                 |
| `orders/application/handlers/get-user-orders.handler.ts`          | 100      | 100      | 100     | 100       | -                 |
| `orders/application/handlers/update-order-status.handler.ts`      | 100      | 100      | 100     | 100       | -                 |
| `products/application/handlers/create-product.handler.ts`         | 100      | 100      | 100     | 100       | -                 |
| `products/application/handlers/delete-product.handler.ts`         | 100      | 100      | 100     | 100       | -                 |
| `products/application/handlers/get-all-products.handler.ts`       | 87.5     | 100      | 100     | 85.71     | 36-40             |
| `products/application/handlers/get-available-products.handler.ts` | 100      | 100      | 100     | 100       | -                 |
| `products/application/handlers/get-product-by-id.handler.ts`      | 100      | 100      | 100     | 100       | -                 |
| `products/application/handlers/update-product.handler.ts`         | 100      | 100      | 100     | 100       | -                 |
| `users/application/handlers/create-user.handler.ts`               | 100      | 100      | 100     | 100       | -                 |
| `users/application/handlers/get-user-by-email.handler.ts`         | 100      | 100      | 100     | 100       | -                 |
| `users/application/handlers/get-user-by-id.handler.ts`            | 100      | 100      | 100     | 100       | -                 |

All main business logic handlers are covered at nearly 100%.
