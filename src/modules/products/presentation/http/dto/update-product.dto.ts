import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Gaming Laptop Pro',
    minLength: 1,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-performance professional gaming laptop',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Product price',
    example: 1499.99,
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Product stock quantity',
    example: 5,
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock must be greater than or equal to 0' })
  stock?: number;

  @ApiPropertyOptional({
    description: 'Product active status',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
