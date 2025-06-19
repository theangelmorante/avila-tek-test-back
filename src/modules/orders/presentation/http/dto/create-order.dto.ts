import {
  IsArray,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  productId: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'Los items deben ser un array' })
  @ArrayMinSize(1, { message: 'El pedido debe contener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
