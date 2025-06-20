# Componentes de Infraestructura Compartidos

Este directorio contiene componentes globales que se aplican a toda la aplicación para estandarizar el comportamiento y las respuestas.

## Componentes

### 1. ResponseInterceptor

**Ubicación**: `interceptors/response.interceptor.ts`

**Propósito**: Estandariza todas las respuestas de la API con un formato consistente.

**Formato de respuesta exitosa**:

```json
{
  "success": true,
  "code": 200,
  "message": "Operación exitosa",
  "data": {
    /* datos de la respuesta */
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/products",
  "method": "GET"
}
```

**Formato de respuesta de error**:

```json
{
  "success": false,
  "code": 400,
  "message": "Los datos proporcionados son inválidos",
  "error": "ValidationError",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/products",
  "method": "POST",
  "details": [
    {
      "field": "name",
      "value": "",
      "constraints": ["El nombre es requerido"]
    }
  ]
}
```

**Características**:

- Detecta automáticamente si la respuesta ya está estandarizada
- Preserva el formato de respuestas con `message` y `data`
- Aplica formato estándar a respuestas simples
- Maneja errores de manera consistente

### 2. GlobalExceptionFilter

**Ubicación**: `filters/global-exception.filter.ts`

**Propósito**: Captura y formatea todas las excepciones de la aplicación.

**Características**:

- Maneja excepciones HTTP y errores generales
- Proporciona mensajes de error consistentes
- Incluye detalles de validación cuando están disponibles
- Registra errores con logging detallado

### 3. ValidationPipe

**Ubicación**: `pipes/validation.pipe.ts`

**Propósito**: Valida automáticamente los DTOs de entrada.

**Características**:

- Valida automáticamente todos los DTOs
- Proporciona errores de validación detallados
- Formatea errores de validación de manera consistente
- Registra errores de validación

## Códigos de Estado HTTP Soportados

### Respuestas Exitosas

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Operación completada sin contenido

### Errores de Cliente

- `400 Bad Request`: Los datos proporcionados son inválidos
- `401 Unauthorized`: Credenciales inválidas o token expirado
- `403 Forbidden`: No tienes permisos para realizar esta acción
- `404 Not Found`: El recurso solicitado no existe
- `409 Conflict`: El recurso ya existe o hay un conflicto
- `422 Unprocessable Entity`: Los datos proporcionados no pueden ser procesados

### Errores de Servidor

- `500 Internal Server Error`: Ha ocurrido un error interno
- `503 Service Unavailable`: El servicio no está disponible temporalmente

## Uso

Los componentes se aplican automáticamente a toda la aplicación desde `main.ts`:

```typescript
// Configurar pipes globales
app.useGlobalPipes(new CustomValidationPipe());

// Configurar filtro de excepciones global
app.useGlobalFilters(new GlobalExceptionFilter());

// Configurar interceptor de respuesta global
app.useGlobalInterceptors(new ResponseInterceptor());
```

## Beneficios

1. **Consistencia**: Todas las respuestas siguen el mismo formato
2. **Mantenibilidad**: Cambios en el formato se aplican globalmente
3. **Debugging**: Información detallada para debugging
4. **Documentación**: Swagger muestra el formato real de las respuestas
5. **Experiencia del desarrollador**: Formato predecible para consumir la API
