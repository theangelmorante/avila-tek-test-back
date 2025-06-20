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
      errorMessage = 'Unknown error';
    }

    // Log the error
    this.logger.error(
      `Error ${statusCode} in ${method} ${url}: ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // If it's a validation error, extract details
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
