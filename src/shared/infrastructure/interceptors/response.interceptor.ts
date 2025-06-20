import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: string;
  path: string;
  method: string;
  pagination?: any;
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
      [HttpStatus.OK]: 'Operation successful',
      [HttpStatus.CREATED]: 'Resource created successfully',
      [HttpStatus.ACCEPTED]: 'Request accepted',
      [HttpStatus.NO_CONTENT]: 'Operation completed without content',
      [HttpStatus.BAD_REQUEST]: 'Invalid request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Access forbidden',
      [HttpStatus.NOT_FOUND]: 'Resource not found',
      [HttpStatus.CONFLICT]: 'Request conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable entity',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal server error',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service unavailable',
    };

    return messages[statusCode] || 'Operation completed';
  }

  private getErrorMessage(statusCode: number): string {
    const messages: { [key: number]: string } = {
      [HttpStatus.BAD_REQUEST]: 'The provided data is invalid',
      [HttpStatus.UNAUTHORIZED]: 'Invalid credentials or expired token',
      [HttpStatus.FORBIDDEN]:
        'You do not have permission to perform this action',
      [HttpStatus.NOT_FOUND]: 'The requested resource does not exist',
      [HttpStatus.CONFLICT]:
        'The resource already exists or there is a conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]:
        'The provided data cannot be processed',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'An internal error has occurred',
      [HttpStatus.SERVICE_UNAVAILABLE]:
        'The service is temporarily unavailable',
    };

    return messages[statusCode] || 'An error has occurred';
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T> | ErrorResponse> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    const timestamp = new Date().toISOString();

    this.logger.debug(`Processing ${method} ${url}`);

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode || HttpStatus.OK;
        const message = this.getStatusMessage(statusCode);

        // If response is already standardized, return it as is
        if (data && typeof data === 'object' && 'success' in data) {
          this.logger.debug(
            `Response already standardized for ${method} ${url}`,
          );
          return data;
        }

        // If response has specific format with 'message' and 'data', preserve it
        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          'data' in data
        ) {
          this.logger.debug(
            `Response with specific format for ${method} ${url}`,
          );
          return {
            success: true,
            code: statusCode,
            message: data.message,
            data: data.data,
            pagination: data.pagination,
            timestamp,
            path: url,
            method,
          };
        }

        // Standard response
        this.logger.debug(`Applying standard format for ${method} ${url}`);
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
    );
  }
}
