import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ExceptionResponse {
  success: false;
  code: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

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

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { method, url } = request;
    const timestamp = new Date().toISOString();

    let statusCode: number;
    let message: string;
    let errorMessage: string;
    let details: any = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || this.getErrorMessage(statusCode);
        errorMessage = responseObj.error || exception.message;
        details = responseObj.details;
      } else {
        message = this.getErrorMessage(statusCode);
        errorMessage = exception.message;
      }
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.getErrorMessage(statusCode);
      errorMessage = exception.message;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.getErrorMessage(statusCode);
      errorMessage = 'Error desconocido';
    }

    // Log del error
    this.logger.error(
      `Error ${statusCode} en ${method} ${url}: ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Si es un error de validación, extraer detalles
    if (
      statusCode === HttpStatus.BAD_REQUEST &&
      exception instanceof HttpException
    ) {
      const exceptionResponse = exception.getResponse() as any;
      if (Array.isArray(exceptionResponse.message)) {
        details = exceptionResponse.message;
      }
    }

    const errorResponse: ExceptionResponse = {
      success: false,
      code: statusCode,
      message,
      error: errorMessage,
      timestamp,
      path: url,
      method,
      details,
    };

    response.status(statusCode).json(errorResponse);
  }
}
