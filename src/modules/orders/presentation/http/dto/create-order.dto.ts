import {
  IsArray,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'clx1234567890',
    type: String,
  })
  @IsString({ message: 'Product ID must be a string' })
  productId: string;

  @ApiProperty({
    description: 'Product quantity',
    example: 2,
    minimum: 1,
    type: Number,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of products in the order',
    type: [OrderItemDto],
    minItems: 1,
  })
  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'Order must contain at least one product' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
