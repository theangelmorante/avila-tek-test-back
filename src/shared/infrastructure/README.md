# Shared Infrastructure Components

This directory contains global components that are applied to the entire application to standardize behavior and responses.

## Components

### 1. ResponseInterceptor

**Location**: `interceptors/response.interceptor.ts`

**Purpose**: Standardizes all API responses with a consistent format.

**Successful response format**:

```json
{
  "success": true,
  "code": 200,
  "message": "Operation successful",
  "data": {
    /* response data */
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/products",
  "method": "GET"
}
```

**Error response format**:

```json
{
  "success": false,
  "code": 400,
  "message": "The provided data is invalid",
  "error": "ValidationError",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/products",
  "method": "POST",
  "details": [
    {
      "field": "name",
      "value": "",
      "constraints": ["Name is required"]
    }
  ]
}
```

**Features**:

- Automatically detects if response is already standardized
- Preserves format for responses with `message` and `data`
- Applies standard format to simple responses
- Handles errors consistently

### 2. GlobalExceptionFilter

**Location**: `filters/global-exception.filter.ts`

**Purpose**: Captures and formats all application exceptions.

**Features**:

- Handles HTTP exceptions and general errors
- Provides consistent error messages
- Includes validation details when available
- Logs errors with detailed information

### 3. ValidationPipe

**Location**: `pipes/validation.pipe.ts`

**Purpose**: Automatically validates input DTOs.

**Features**:

- Automatically validates all DTOs
- Provides detailed validation errors
- Formats validation errors consistently
- Logs validation errors

## Supported HTTP Status Codes

### Successful Responses

- `200 OK`: Operation successful
- `201 Created`: Resource created successfully
- `204 No Content`: Operation completed without content

### Client Errors

- `400 Bad Request`: The provided data is invalid
- `401 Unauthorized`: Invalid credentials or expired token
- `403 Forbidden`: You do not have permission to perform this action
- `404 Not Found`: The requested resource does not exist
- `409 Conflict`: The resource already exists or there is a conflict
- `422 Unprocessable Entity`: The provided data cannot be processed

### Server Errors

- `500 Internal Server Error`: An internal error has occurred
- `503 Service Unavailable`: The service is temporarily unavailable

## Usage

Components are automatically applied to the entire application from `main.ts`:

```typescript
// Configure global pipes
app.useGlobalPipes(new CustomValidationPipe());

// Configure global exception filter
app.useGlobalFilters(new GlobalExceptionFilter());

// Configure global response interceptor
app.useGlobalInterceptors(new ResponseInterceptor());
```

## Benefits

1. **Consistency**: All responses follow the same format
2. **Maintainability**: Changes to format are applied globally
3. **Debugging**: Detailed information for debugging
4. **Documentation**: Swagger shows the actual response format
5. **Developer Experience**: Predictable format for consuming the API
