import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(ValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const validationErrors = errors.map((error) => {
        const constraints = error.constraints;
        const property = error.property;

        return {
          field: property,
          value: error.value,
          constraints: constraints
            ? Object.values(constraints)
            : ['Invalid field'],
        };
      });

      this.logger.warn(`Validation error: ${JSON.stringify(validationErrors)}`);

      throw new BadRequestException({
        message: 'The provided data is invalid',
        error: 'ValidationError',
        details: validationErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
