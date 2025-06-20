import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface StandardResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: string;
  path: string;
  method: string;
}

export interface ErrorResponse {
  success: false;
  code: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  private readonly logger = new Logger(ResponseInterceptor.name);

  private getStatusMessage(statusCode: number): string {
    const messages: { [key: number]: string } = {
      [HttpStatus.OK]: 'Operación exitosa',
      [HttpStatus.CREATED]: 'Recurso creado exitosamente',
      [HttpStatus.ACCEPTED]: 'Solicitud aceptada',
      [HttpStatus.NO_CONTENT]: 'Operación completada sin contenido',
      [HttpStatus.BAD_REQUEST]: 'Solicitud incorrecta',
      [HttpStatus.UNAUTHORIZED]: 'No autorizado',
      [HttpStatus.FORBIDDEN]: 'Acceso prohibido',
      [HttpStatus.NOT_FOUND]: 'Recurso no encontrado',
      [HttpStatus.CONFLICT]: 'Conflicto en la solicitud',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Entidad no procesable',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Servicio no disponible',
    };

    return messages[statusCode] || 'Operación completada';
  }

  private getErrorMessage(statusCode: number): string {
    const messages: { [key: number]: string } = {
      [HttpStatus.BAD_REQUEST]: 'Los datos proporcionados son inválidos',
      [HttpStatus.UNAUTHORIZED]: 'Credenciales inválidas o token expirado',
      [HttpStatus.FORBIDDEN]: 'No tienes permisos para realizar esta acción',
      [HttpStatus.NOT_FOUND]: 'El recurso solicitado no existe',
      [HttpStatus.CONFLICT]: 'El recurso ya existe o hay un conflicto',
      [HttpStatus.UNPROCESSABLE_ENTITY]:
        'Los datos proporcionados no pueden ser procesados',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Ha ocurrido un error interno',
      [HttpStatus.SERVICE_UNAVAILABLE]:
        'El servicio no está disponible temporalmente',
    };

    return messages[statusCode] || 'Ha ocurrido un error';
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T> | ErrorResponse> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    const timestamp = new Date().toISOString();

    this.logger.debug(`Procesando ${method} ${url}`);

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode || HttpStatus.OK;
        const message = this.getStatusMessage(statusCode);

        // Si la respuesta ya está estandarizada, la devolvemos tal como está
        if (data && typeof data === 'object' && 'success' in data) {
          this.logger.debug(`Respuesta ya estandarizada para ${method} ${url}`);
          return data;
        }

        // Si la respuesta tiene un formato específico con 'message' y 'data', lo preservamos
        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          'data' in data
        ) {
          this.logger.debug(
            `Respuesta con formato específico para ${method} ${url}`,
          );
          return {
            success: true,
            code: statusCode,
            message: data.message,
            data: data.data,
            timestamp,
            path: url,
            method,
          };
        }

        // Respuesta estándar
        this.logger.debug(`Aplicando formato estándar para ${method} ${url}`);
        return {
          success: true,
          code: statusCode,
          message,
          data,
          timestamp,
          path: url,
          method,
        };
      }),
      catchError((error) => {
        const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = this.getErrorMessage(statusCode);
        const errorMessage = error.message || 'Error desconocido';

        this.logger.error(
          `Error en ${method} ${url}: ${errorMessage}`,
          error.stack,
        );

        const errorResponse: ErrorResponse = {
          success: false,
          code: statusCode,
          message,
          error: errorMessage,
          timestamp,
          path: url,
          method,
        };

        return throwError(() => ({
          ...errorResponse,
          statusCode,
        }));
      }),
    );
  }
}
