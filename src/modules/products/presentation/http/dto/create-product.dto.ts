import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Gaming Laptop',
    minLength: 1,
    type: String,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-performance gaming laptop',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Product price',
    example: 1299.99,
    minimum: 0,
    type: Number,
  })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price: number;

  @ApiProperty({
    description: 'Product stock quantity',
    example: 10,
    minimum: 0,
    type: Number,
  })
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock must be greater than or equal to 0' })
  stock: number;
}
